#!/usr/bin/env python3
"""
Helper script for Vercel deployment
"""

import os
import sys
import json
from pathlib import Path

# Create the .vercel directory if it doesn't exist
vercel_dir = Path(".vercel")
vercel_dir.mkdir(exist_ok=True)

# Ensure we have the lightweight requirements file
light_reqs = Path("requirements-light.txt")
vercel_reqs = vercel_dir / "requirements.txt"

if light_reqs.exists():
    print(f"Copying {light_reqs} to {vercel_reqs}")
    with open(light_reqs, "r") as src:
        with open(vercel_reqs, "w") as dest:
            dest.write(src.read())
else:
    print(f"Error: {light_reqs} not found!")
    sys.exit(1)

# Create a specific project.json for Vercel
project_config = {
    "buildCommand": None,
    "devCommand": None,
    "installCommand": "pip install -r .vercel/requirements.txt",
    "framework": None,
    "outputDirectory": None
}

with open(vercel_dir / "project.json", "w") as f:
    json.dump(project_config, f, indent=2)

print("Vercel deployment files ready!")
print("Use 'vercel deploy --prod' to deploy") 