#!/bin/sh

echo "Installing minimal dependencies for Vercel deployment..."
pip install --disable-pip-version-check --target . --no-cache-dir fastapi==0.110.0 uvicorn==0.29.0 python-multipart==0.0.9 pydantic==2.7.1

echo "Installation complete!" 