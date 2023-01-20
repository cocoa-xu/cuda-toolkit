# cuda-toolkit

This action installs the [NVIDIA® CUDA® Toolkit](https://developer.nvidia.com/cuda-toolkit) on the system. It adds the cuda install location as `CUDA_PATH` to `GITHUB_ENV` so you can access the CUDA install location in subsequent steps. `CUDA_PATH/bin` is added to `GITHUB_PATH` so you can use commands such as `nvcc` directly in subsequent steps. Right now both `windows-2019` and `ubuntu-20.04` runners have been tested to work successfully.

## Inputs

### `cuda`

**Optional** The CUDA version to install. View `src/link/windows-links.ts` and `src/link/linux-links.ts` for available versions.

Default: `'11.8.0'`.

### `cudnn`, `cudnn_url` and `cudnn_archive_dir`

**Optional** The cudnn version, the URL to the cudnn archive file (.zip file for Windows and .tar.xz file for Linux) and the name of the unarchived directory.

A user provided URL is needed as the official cudnn archive would require a valid login to download. Therefore, we need to follow these steps:

1. Download the offical archive file from NVIDIA, [cudnn-download](https://developer.nvidia.com/rdp/cudnn-download).
2. Serve the archive file where (only) you can access.
3. Set `cudnn`, `cudnn_url` and `cudnn_archive_dir`.

For example, to use cudnn 8.7.0 on Windows, you'll need to download https://developer.nvidia.com/downloads/c118-cudnn-windows-8664-87084cuda11-archivezip from NVIDIA website. Note that this requires you to have an NVIDIA developer account.

Since we are using cudnn 8.7.0, we need to set `cudnn` to `"8.7.0"`.

Once you suceesfully downloaded the file, and if you unarchive that file, there will be a directory with the same name as the zip file (excluding the `.zip` file extension):

```
.
├── cudnn-windows-x86_64-8.7.0.84_cuda11-archive.zip
└── cudnn-windows-x86_64-8.7.0.84_cuda11-archive
    ├── LICENSE
    ├── bin
    │   └── *.dll
    ├── include
    │   └── *.h
    └── lib
        └── x64
            └── *.lib
```

The dir name, `cudnn-windows-x86_64-8.7.0.84_cuda11-archive`, should be the value of `cudnn_archive_dir`. Note that we only need to serve the `.zip` file; the unarchiving operation here is to show the expected structure and the name of the unarchived directory.

Lastly, once you uploaded this `.zip` file to your server, and let' suppose it can be accessed at `https://example.com/cudnn-windows-x86_64-8.7.0.84_cuda11-archive.zip`, then `cudnn_url` should be set to `"https://example.com/cudnn-windows-x86_64-8.7.0.84_cuda11-archive.zip"`.

Of course, you can store the URL as a secret in GitHub Actions, and use the corresponding secret in your workflow file.

### `sub-packages`

**NOTE: On Linux this only works with the 'network' method [view details](#method)**

**Optional**
If set, only the specified CUDA subpackages will be installed.
Only installs specified subpackages, must be in the form of a JSON array. For example, if you only want to install nvcc and visual studio integration: `'["nvcc", "visual_studio_integration"]'` (double quotes required)

Default: `'[]'`.

### `method`

**Optional**
Installation method, can be either `'local'` or `'network'`.

- `'local'` downloads the entire installer with all packages and runs that (you can still only install certain packages with `sub-packages` on Windows).
- `'network'` downloads a smaller executable which only downloads necessary packages which you can define in `sub-packages`.

Default: `'local'`.

### `linux-local-args`

**Optional**
(For Linux and 'local' method only) override arguments for the Linux `.run` installer. For example if you don't want samples use `'["--toolkit"]'` (double quotes required)
See the [Nvidia Docs](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#runfile-advanced) for available options. Note that the `--silent` option is already always added by the action itself.

Default: `'["--toolkit", "--samples"]'`.

## Outputs

### `cuda`

The cuda version installed (same as `cuda` from input).

### `CUDA_PATH`

The path where cuda is installed (same as `CUDA_PATH` in `GITHUB_ENV`).

## Example usage

```yaml
steps:
- uses: Jimver/cuda-toolkit@v0.2.8
  id: cuda-toolkit
  with:
    cuda: '11.7.0'

- run: echo "Installed cuda version is: ${{steps.cuda-toolkit.outputs.cuda}}"

- run: echo "Cuda install location: ${{steps.cuda-toolkit.outputs.CUDA_PATH}}"

- run: nvcc -V
```
