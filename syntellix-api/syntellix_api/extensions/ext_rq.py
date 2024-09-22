from rq import Queue
from redis import Redis
from flask import Flask, current_app
from functools import wraps

def init_app(app: Flask) -> Queue:
    redis_conn = Redis.from_url(app.config['RQ_REDIS_URL'])
    
    queue = Queue('document_processing', connection=redis_conn)
    
    app.extensions['rq'] = queue
    
    # 检查 RQ 是否创建成功
    try:
        queue.count
        app.logger.info("RQ created successfully")
    except Exception as e:
        app.logger.error(f"Failed to create RQ: {str(e)}")
        raise

    def create_task_with_app_context(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            with current_app.app_context():
                return func(*args, **kwargs)
        return wrapper

    app.create_task_with_app_context = create_task_with_app_context

    return queue