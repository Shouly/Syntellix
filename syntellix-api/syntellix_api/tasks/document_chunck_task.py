import datetime
import logging
import time

import click
from celery import shared_task
from syntellix_api.extensions import db
from syntellix_api.models.dataset_model import Document, DocumentParserTypeEnum, DocumentParseStatusEnum
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
def process_document_chunk(self, document_id):
    try:
        document = Document.query.get(document_id)
        if not document:
            raise ValueError(f"Document with id {document_id} not found")

        parser_type = document.parser_type
        parser_config = document.parser_config

        if parser_type not in FACTORY:
            raise ValueError(f"Unsupported parser type: {parser_type}")

        parser = FACTORY[parser_type]

        def progress_callback(progress, message):
            document.progress = progress * 100  # Convert to percentage
            document.progress_msg = message
            document.updated_at = datetime.datetime.now()
            db.session.commit()

        document.process_begin_at = datetime.datetime.now()
        document.parse_status = DocumentParseStatusEnum.PROCESSING.value
        document.updated_at = datetime.datetime.now()
        db.session.commit()

        chunks = parser.chunk(
            document.location, parser_config, callback=progress_callback
        )

        # Process chunks logic here
        

        document.parse_status = DocumentParseStatusEnum.COMPLETED.value
        document.process_duation = (
            datetime.datetime.now() - document.process_begin_at
        ).total_seconds()
        document.updated_at = datetime.datetime.now()
        db.session.commit()

        return f"Document {document_id} processed successfully"
    except Exception as e:
        document.parse_status = DocumentParseStatusEnum.FAILED.value
        document.progress_msg = str(e)
        document.updated_at = datetime.datetime.now()
        db.session.commit()
        raise self.retry(exc=e, countdown=60, max_retries=3)
