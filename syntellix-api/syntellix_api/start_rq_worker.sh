#!/bin/bash
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
poetry run python run_rq_worker.py