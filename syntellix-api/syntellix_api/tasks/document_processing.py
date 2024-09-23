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
            document.progress_status = DocumentParseStatusEnum.PROCESSING
            db.session.commit()
            logger.info(f"Document {document_id} progress: {document.progress}% - {message}")

        chunks = parser.chunk(
            document.name,
            binary=file_binary,
            from_page=0,
            to_page=100000,
            parser_config=parser_config,
            callback=update_progress,
        )

        update_progress(0.5, "Parsing completed. Starting embedding process.")

        vector_service = VectorService(tenant_id)
        
        # Initialize the embedding model
        embedding_model = EmbeddingModel(model_name=syntellix_config.EMBEDDING_MODEL_NAME)
        
        nodes = []
        total_chunks = len(chunks)
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
            update_progress(embedding_progress, f"Embedding progress: {i}/{total_chunks}")

        update_progress(0.9, "Embedding completed. Adding nodes to vector database.")
        
        # Add nodes to vector database
        vector_service.add_nodes(nodes)

        update_progress(1.0, "Processing completed")
        document.parse_status = DocumentParseStatusEnum.COMPLETED
        db.session.commit()

    except Exception as e:
        logger.error(f"Error processing document {document_id}: {str(e)}")
        document.parse_status = DocumentParseStatusEnum.FAILED
        document.progress_msg = f"Processing failed: {str(e)}"
        document.progress = 0
        db.session.commit()
