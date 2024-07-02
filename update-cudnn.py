#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from io import StringIO
import json
import requests
import re

supported_platforms = [
    'linux-aarch64',
    'linux-x86_64',
    'linux-ppc64le',
    'linux-sbsa',
    'windows-x86_64',
]
cudnn_redist_base = 'https://developer.download.nvidia.com/compute/cudnn/redist'
cudnn_redist_re = re.compile(r'>redistrib_([\d]+.[\d]+.[\d]+).json<')

def update_cudnn():
    r = requests.get(cudnn_redist_base)
    matches = cudnn_redist_re.findall(r.text)
    platform_cudnn = {platform:{} for platform in supported_platforms}
    for cudnn_version in matches:
        print(f'[+] cudnn_version={cudnn_version}')
        cudnn_redist_json = f"{cudnn_redist_base}/redistrib_{cudnn_version}.json"
        r = requests.get(cudnn_redist_json)
        data = json.loads(r.text)
        if data is None or 'cudnn' not in data:
            print('[!]  error: cudnn not found in json')
            continue
        cudnn_release_data = data['cudnn']
        for platform in supported_platforms:
            if platform in cudnn_release_data:
                platform_data = cudnn_release_data[platform]
                for cuda_variant, variant_data in platform_data.items():
                    print(f'[-]  platform={platform}, cuda_variant={cuda_variant}')
                    download_url = f"{cudnn_redist_base}/{variant_data['relative_path']}"
                    sha256 = variant_data['sha256']
                    size = variant_data['size']
                    if cudnn_version not in platform_cudnn[platform]:
                        platform_cudnn[platform][cudnn_version] = []
                    platform_cudnn[platform][cudnn_version].append((int(cuda_variant[4:]), download_url, sha256, size))
    # update src/links/*.ts
    for platform, platform_cudnn_data in platform_cudnn.items():
        if len(platform_cudnn_data) > 0:
            cudnn_version_strs = []
            for cudnn_version, compatible_cuda in platform_cudnn_data.items():
                items = []
                for cuda_variant, download_url, _sha256, _size in compatible_cuda:
                    item = \
f'''          [
            {cuda_variant},
            '{download_url}'
          ]'''
                    items.append(item)
                items = ',\n'.join(items)
                cudnn_version_str = \
f'''      [
        '{cudnn_version}',
        new Map([
{items}
        ])
      ]'''
                cudnn_version_strs.append(cudnn_version_str)
            cudnn_version_strs = ',\n'.join(cudnn_version_strs)
            updated_file = StringIO()
            platform_ts = f'src/links/{platform}-links.ts'
            with open(platform_ts, 'r') as f:
                find_close_bracket = False
                for line in f:
                    if line.strip() == 'this.cudnnVersionToURL = new Map([':
                        updated_file.write(line)
                        updated_file.write(cudnn_version_strs)
                        updated_file.write('\n    ])\n')
                        find_close_bracket = True
                    else:
                        if find_close_bracket:
                            if line.startswith('    ])'):
                                find_close_bracket = False
                            continue
                        updated_file.write(line)
            with open(platform_ts, 'w') as f:
                f.write(updated_file.getvalue())

if __name__ == '__main__':
    update_cudnn()
