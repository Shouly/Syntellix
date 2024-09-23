import logging
from datetime import datetime

from celery import shared_task
from syntellix_api.configs import syntellix_config
from syntellix_api.extensions.ext_database import db
from syntellix_api.models.dataset_model import (
    Document,
    DocumentParserTypeEnum,
    DocumentParseStatusEnum,
)
from syntellix_api.rag.app import (
    audio,
    book,
    email_app,
    knowledge_graph,
    laws,
    manual,
    naive,
    one,
    paper,
    picture,
    presentation,
    qa,
    resume,
    table,
)
from syntellix_api.rag.vector_database.vector_service import VectorService
from syntellix_api.rag.vector_database.vector_model import BaseNode
from syntellix_api.services.file_service import FileService
from syntellix_api.rag.llm.embedding_model_local import EmbeddingModel

logger = logging.getLogger(__name__)

FACTORY = {
    DocumentParserTypeEnum.NAIVE.value: naive,
    DocumentParserTypeEnum.PAPER.value: paper,
    DocumentParserTypeEnum.BOOK.value: book,
    DocumentParserTypeEnum.PRESENTATION.value: presentation,
    DocumentParserTypeEnum.MANUAL.value: manual,
    DocumentParserTypeEnum.LAWS.value: laws,
    DocumentParserTypeEnum.QA.value: qa,
    DocumentParserTypeEnum.TABLE.value: table,
    DocumentParserTypeEnum.RESUME.value: resume,
    DocumentParserTypeEnum.PICTURE.value: picture,
    DocumentParserTypeEnum.ONE.value: one,
    DocumentParserTypeEnum.AUDIO.value: audio,
    DocumentParserTypeEnum.EMAIL.value: email_app,
    DocumentParserTypeEnum.KG.value: knowledge_graph,
}


@shared_task(queue="document_processing")
def process_document(
    document_id, file_key, parser_type, parser_config, tenant_id, knowledge_base_id
):
    try:
        document = Document.query.get(document_id)
        if not document:
            logger.error(f"Document not found: {document_id}")
            return

        parser = FACTORY[parser_type]
        file_binary = FileService.read_file_binary(file_key)

        def update_progress(progress, message):
            document.progress = int(progress * 100)
            document.progress_msg = message
            db.session.commit()
            logger.info(f"Document {document_id} progress: {document.progress}% - {message}")

        # 更新状态为处理中
        document.parse_status = DocumentParseStatusEnum.PROCESSING
        document.begin_time = datetime.now()
        db.session.commit()

        chunks = parser.chunk(
            document.name,
            binary=file_binary,
            from_page=0,
            to_page=100000,
            parser_config=parser_config,
            callback=update_progress,
        )

        if not chunks:
            update_progress(1.0, "文件解析失败，未找到有效内容")
            document.parse_status = DocumentParseStatusEnum.FAILED
            db.session.commit()
            return

        update_progress(0.5, "文件解析完成，开始嵌入过程")

        vector_service = VectorService(tenant_id)
        
        # Initialize the embedding model
        embedding_model = EmbeddingModel(model_name=syntellix_config.EMBEDDING_MODEL_NAME)
        
        nodes = []
        total_chunks = len(chunks)
        print(f"total_chunks: {total_chunks}")
        for i, chunk in enumerate(chunks, 1):
            text = chunk["content_with_weight"]
            # Calculate embedding for each text chunk individually
            vector = embedding_model.encode([text])[0]
            
            node = BaseNode(
                content=text,
                embedding=vector,
                metadata={
                    "document_id": document_id,
                    "knowledge_base_id": knowledge_base_id,
                    "created_at": datetime.now(),
                }
            )
            nodes.append(node)

            # Update progress for embedding process
            embedding_progress = 0.5 + (i / total_chunks) * 0.4
            update_progress(embedding_progress, f"嵌入进度: {i}/{total_chunks}")

        update_progress(0.9, "文件嵌入完成，开始保存嵌入数据")
        
        # Add nodes to vector database
        vector_service.add_nodes(nodes)

        update_progress(1.0, "处理完成")
        document.parse_status = DocumentParseStatusEnum.COMPLETED
        document.chunk_num = total_chunks
        document.process_duration = (datetime.now() - document.begin_time).total_seconds()
        db.session.commit()

    except Exception as e:
        logger.error(f"Error processing document {document_id}: {str(e)}")
        document.parse_status = DocumentParseStatusEnum.FAILED
        document.progress_msg = f"Processing failed: {str(e)}"
        document.progress = 0
        db.session.commit()
