import datetime
import logging

from celery import shared_task
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
from syntellix_api.services.file_service import FileService

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


@shared_task(queue="document_chunk")
def process_document_chunk(document_id):
    try:
        logger.info(f"Processing document chunk {document_id}")

        document = Document.query.get(document_id)
        if not document:
            raise ValueError(f"Document with id {document_id} not found")

        parser_type = document.parser_type
        parser_config = document.parser_config

        if parser_type not in FACTORY:
            raise ValueError(f"Unsupported parser type: {parser_type}")

        parser = FACTORY[parser_type]

        def progress_callback(progress, message):
            document.update_parse_status(
                DocumentParseStatusEnum.PROCESSING, progress * 100, message
            )

        document.process_begin_at = datetime.datetime.now()
        document.update_parse_status(DocumentParseStatusEnum.PROCESSING)
        db.session.commit()

        file_binary = FileService.read_file_binary(document.location)

        chunks = parser.chunk(
            document.name,
            binary=file_binary,
            from_page=0,
            to_page=100000,
            callback=progress_callback,
            parser_config=parser_config,
        )

        try:
            vector_service = VectorService(
                document.tenant_id, document.knowledge_base_id, document.id
            )
            vector_service.add_nodes(chunks)
        except Exception as e:
            logger.error(f"Error adding nodes to vector service: {str(e)}")
            document.update_parse_status(
                DocumentParseStatusEnum.FAILED, progress_msg=f"Vector service error: {str(e)}"
            )
            db.session.commit()
            raise

        document.update_parse_status(DocumentParseStatusEnum.COMPLETED, 100)
        document.chunk_num = len(chunks)
        document.process_end_at = datetime.datetime.now()
        document.process_duation = (
            document.process_end_at - document.process_begin_at
        ).total_seconds()
        db.session.commit()

        logger.info(f"Document {document_id} processed successfully")

    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}")
        document.update_parse_status(
            DocumentParseStatusEnum.FAILED, progress_msg=str(e)
        )
    except Exception as e:
        document.update_parse_status(
            DocumentParseStatusEnum.FAILED, progress_msg=str(e)
        )
        logger.error(f"Document {document_id} processing failed: {str(e)}")
        raise process_document_chunk.retry(exc=e, countdown=60, max_retries=3)
