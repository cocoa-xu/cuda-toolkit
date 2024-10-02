import {AbstractLinks} from './links'

/**
 * Singleton class for aarch64 Linux links.
 */
export class LinuxAArch64Links extends AbstractLinks {
  // Singleton instance
  private static _instance: LinuxAArch64Links

  // Private constructor to prevent instantiation
  private constructor() {
    super()
    // Map of cuda SemVer version to download URL
    this.cudaVersionToURL = new Map([
      [
        '12.6.2',
        'https://developer.download.nvidia.com/compute/cuda/12.6.2/local_installers/cuda_12.6.2_560.35.03_linux.run'
      ],
      [
        '12.6.1',
        'https://developer.download.nvidia.com/compute/cuda/12.6.1/local_installers/cuda_12.6.1_560.35.03_linux.run'
      ],
      [
        '12.6.0',
        'https://developer.download.nvidia.com/compute/cuda/12.6.0/local_installers/cuda_12.6.0_560.28.03_linux.run'
      ],
      [
        '12.5.1',
        'https://developer.download.nvidia.com/compute/cuda/12.5.1/local_installers/cuda_12.5.1_555.42.06_linux_sbsa.run'
      ],
      [
        '12.5.0',
        'https://developer.download.nvidia.com/compute/cuda/12.5.0/local_installers/cuda_12.5.0_555.42.02_linux_sbsa.run'
      ],
      [
        '12.4.1',
        'https://developer.download.nvidia.com/compute/cuda/12.4.1/local_installers/cuda_12.4.1_550.54.15_linux_sbsa.run'
      ],
      [
        '12.4.0',
        'https://developer.download.nvidia.com/compute/cuda/12.4.0/local_installers/cuda_12.4.0_550.54.14_linux_sbsa.run'
      ],
      [
        '12.3.2',
        'https://developer.download.nvidia.com/compute/cuda/12.3.2/local_installers/cuda_12.3.2_545.23.08_linux_sbsa.run'
      ],
      [
        '12.3.1',
        'https://developer.download.nvidia.com/compute/cuda/12.3.1/local_installers/cuda_12.3.1_545.23.08_linux_sbsa.run'
      ],
      [
        '12.3.0',
        'https://developer.download.nvidia.com/compute/cuda/12.3.0/local_installers/cuda_12.3.0_545.23.06_linux_sbsa.run'
      ],
      [
        '12.2.2',
        'https://developer.download.nvidia.com/compute/cuda/12.2.2/local_installers/cuda_12.2.2_535.104.05_linux_sbsa.run'
      ],
      [
        '12.2.1',
        'https://developer.download.nvidia.com/compute/cuda/12.2.1/local_installers/cuda_12.2.1_535.86.10_linux_sbsa.run'
      ],
      [
        '12.2.0',
        'https://developer.download.nvidia.com/compute/cuda/12.2.0/local_installers/cuda_12.2.0_535.54.03_linux_sbsa.run'
      ],
      [
        '12.1.1',
        'https://developer.download.nvidia.com/compute/cuda/12.1.1/local_installers/cuda_12.1.1_530.30.02_linux_sbsa.run'
      ],
      [
        '12.1.0',
        'https://developer.download.nvidia.com/compute/cuda/12.1.0/local_installers/cuda_12.1.0_530.30.02_linux_sbsa.run'
      ],
      [
        '12.0.1',
        'https://developer.download.nvidia.com/compute/cuda/12.0.1/local_installers/cuda_12.0.1_525.85.12_linux_sbsa.run'
      ],
      [
        '12.0.0',
        'https://developer.download.nvidia.com/compute/cuda/12.0.0/local_installers/cuda_12.0.0_525.60.13_linux_sbsa.run'
      ],
      [
        '11.8.0',
        'https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux_sbsa.run'
      ],
      [
        '11.7.0',
        'https://developer.download.nvidia.com/compute/cuda/11.7.0/local_installers/cuda_11.7.0_515.43.04_linux_sbsa.run'
      ],
      [
        '11.6.2',
        'https://developer.download.nvidia.com/compute/cuda/11.6.2/local_installers/cuda_11.6.2_510.47.03_linux_sbsa.run'
      ],
      [
        '11.6.1',
        'https://developer.download.nvidia.com/compute/cuda/11.6.1/local_installers/cuda_11.6.1_510.47.03_linux_sbsa.run'
      ],
      [
        '11.6.0',
        'https://developer.download.nvidia.com/compute/cuda/11.6.0/local_installers/cuda_11.6.0_510.39.01_linux_sbsa.run'
      ],
      [
        '11.5.2',
        'https://developer.download.nvidia.com/compute/cuda/11.5.2/local_installers/cuda_11.5.2_495.29.05_linux_sbsa.run'
      ],
      [
        '11.5.1',
        'https://developer.download.nvidia.com/compute/cuda/11.5.1/local_installers/cuda_11.5.1_495.29.05_linux_sbsa.run'
      ],
      [
        '11.5.0',
        'https://developer.download.nvidia.com/compute/cuda/11.5.0/local_installers/cuda_11.5.0_495.29.05_linux_sbsa.run'
      ],
      [
        '11.4.3',
        'https://developer.download.nvidia.com/compute/cuda/11.4.3/local_installers/cuda_11.4.3_470.82.01_linux_sbsa.run'
      ],
      [
        '11.4.2',
        'https://developer.download.nvidia.com/compute/cuda/11.4.2/local_installers/cuda_11.4.2_470.57.02_linux_sbsa.run'
      ],
      [
        '11.4.1',
        'https://developer.download.nvidia.com/compute/cuda/11.4.1/local_installers/cuda_11.4.1_470.57.02_linux_sbsa.run'
      ],
      [
        '11.4.0',
        'https://developer.download.nvidia.com/compute/cuda/11.4.0/local_installers/cuda_11.4.0_470.42.01_linux_sbsa.run'
      ],
      [
        '11.3.1',
        'https://developer.download.nvidia.com/compute/cuda/11.3.1/local_installers/cuda_11.3.1_465.19.01_linux_sbsa.run'
      ],
      [
        '11.3.0',
        'https://developer.download.nvidia.com/compute/cuda/11.3.0/local_installers/cuda_11.3.0_465.19.01_linux_sbsa.run'
      ],
      [
        '11.2.2',
        'https://developer.download.nvidia.com/compute/cuda/11.2.2/local_installers/cuda_11.2.2_460.32.03_linux_sbsa.run'
      ],
      [
        '11.2.1',
        'https://developer.download.nvidia.com/compute/cuda/11.2.1/local_installers/cuda_11.2.1_460.32.03_linux_sbsa.run'
      ],
      [
        '11.2.0',
        'https://developer.download.nvidia.com/compute/cuda/11.2.0/local_installers/cuda_11.2.0_460.27.04_linux_sbsa.run'
      ],
      [
        '11.1.1',
        'https://developer.download.nvidia.com/compute/cuda/11.1.1/local_installers/cuda_11.1.1_455.32.00_linux_sbsa.run'
      ],
      [
        '11.0.3',
        'https://developer.download.nvidia.com/compute/cuda/11.0.3/local_installers/cuda_11.0.3_450.51.06_linux_sbsa.run'
      ]
    ])
    this.cudnnVersionToURL = new Map([
      [
        '8.9.0',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-8.9.0.131_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '8.9.5',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-8.9.5.30_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '9.0.0',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-9.0.0.312_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '9.1.0',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-9.1.0.70_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '9.1.1',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-9.1.1.17_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '9.2.0',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-9.2.0.82_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '9.2.1',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-9.2.1.18_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '9.3.0',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-9.3.0.75_cuda12-archive.tar.xz'
          ]
        ])
      ],
      [
        '9.4.0',
        new Map([
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/linux-aarch64/cudnn-linux-aarch64-9.4.0.58_cuda12-archive.tar.xz'
          ]
        ])
      ]
    ])
  }

  static get Instance(): LinuxAArch64Links {
    return this._instance || (this._instance = new this())
  }
}
