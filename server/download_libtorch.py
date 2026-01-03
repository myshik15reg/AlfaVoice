#!/usr/bin/env python3
"""
Download Libtorch using Python
Handles redirects and authentication better than curl
"""

import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

# Configuration
LIBTORCH_URLS = [
    "https://download.pytorch.org/libtorch/libtorch-win-shared-with-deps-2.5.1+cu124.zip",
    "https://github.com/pytorch/pytorch/releases/download/v2.5.1/libtorch-win-shared-with-deps-2.5.1%2Bcu124.zip",
]

OUTPUT_FILE = "libtorch.zip"
MIN_SIZE = 100 * 1024 * 1024  # 100MB minimum

def download_with_retry(url, max_retries=3):
    """Download file with retry logic"""
    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1}/{max_retries}: {url}")
            
            # Create request with user agent
            req = urllib.request.Request(
                url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            )
            
            # Download with progress
            with urllib.request.urlopen(req, timeout=300) as response:
                total_size = int(response.getheader('Content-Length', 0))
                downloaded = 0
                
                with open(OUTPUT_FILE, 'wb') as f:
                    while True:
                        chunk = response.read(8192)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded += len(chunk)
                        
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            print(f"\rProgress: {downloaded / (1024*1024):.1f}MB / {total_size / (1024*1024):.1f}MB ({percent:.1f}%)", end='')
                
                print()  # New line after progress
            
            # Check file size
            file_size = os.path.getsize(OUTPUT_FILE)
            if file_size < MIN_SIZE:
                print(f"ERROR: Downloaded file is too small ({file_size / (1024*1024):.1f}MB)")
                os.remove(OUTPUT_FILE)
                return False
            
            print(f"Download completed: {file_size / (1024*1024):.1f}MB")
            return True
            
        except urllib.error.HTTPError as e:
            print(f"HTTP Error: {e.code} - {e.reason}")
            if attempt < max_retries - 1:
                print(f"Retrying in 5 seconds...")
                import time
                time.sleep(5)
        except urllib.error.URLError as e:
            print(f"URL Error: {e.reason}")
            if attempt < max_retries - 1:
                print(f"Retrying in 5 seconds...")
                import time
                time.sleep(5)
        except Exception as e:
            print(f"Error: {e}")
            return False
    
    return False

def main():
    """Main download function"""
    print("=" * 60)
    print("Libtorch Downloader (Python)")
    print("=" * 60)
    print()
    
    # Try each URL
    for url in LIBTORCH_URLS:
        if download_with_retry(url):
            print("\nSUCCESS: Libtorch downloaded successfully!")
            return 0
    
    print("\nERROR: Failed to download Libtorch from all sources")
    print("\nMANUAL DOWNLOAD INSTRUCTIONS:")
    print("1. Visit: https://pytorch.org/get-started/locally/")
    print("2. Select: Stable > Windows > Libtorch > C++ > CUDA 12.4")
    print("3. Download: libtorch-win-shared-with-deps-2.5.1+cu124.zip")
    print("4. Place the file in the current directory as 'libtorch.zip'")
    return 1

if __name__ == "__main__":
    sys.exit(main())
