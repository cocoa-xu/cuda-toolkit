/* eslint-disable filenames/match-regex */
import {AbstractLinks} from './links'
import {SemVer} from 'semver'

/**
 * Singleton class for windows links.
 */
export class WindowsLinks extends AbstractLinks {
  // Singleton instance
  private static _instance: WindowsLinks

  private cudaVersionToNetworkUrl: Map<string, string> = new Map([
    [
      '12.6.2',
      'https://developer.download.nvidia.com/compute/cuda/12.6.2/network_installers/cuda_12.6.2_windows_network.exe'
    ],
    [
      '12.6.1',
      'https://developer.download.nvidia.com/compute/cuda/12.6.1/network_installers/cuda_12.6.1_windows_network.exe'
    ],
    [
      '12.6.0',
      'https://developer.download.nvidia.com/compute/cuda/12.6.0/network_installers/cuda_12.6.0_windows_network.exe'
    ],
    [
      '12.5.1',
      'https://developer.download.nvidia.com/compute/cuda/12.5.1/network_installers/cuda_12.5.1_windows_network.exe'
    ],
    [
      '12.5.0',
      'https://developer.download.nvidia.com/compute/cuda/12.5.0/network_installers/cuda_12.5.0_windows_network.exe'
    ],
    [
      '12.4.1',
      'https://developer.download.nvidia.com/compute/cuda/12.4.1/network_installers/cuda_12.4.1_windows_network.exe'
    ],
    [
      '12.4.0',
      'https://developer.download.nvidia.com/compute/cuda/12.4.0/network_installers/cuda_12.4.0_windows_network.exe'
    ],
    [
      '12.3.2',
      'https://developer.download.nvidia.com/compute/cuda/12.3.2/network_installers/cuda_12.3.2_windows_network.exe'
    ],
    [
      '12.3.1',
      'https://developer.download.nvidia.com/compute/cuda/12.3.1/network_installers/cuda_12.3.1_windows_network.exe'
    ],
    [
      '12.3.0',
      'https://developer.download.nvidia.com/compute/cuda/12.3.0/network_installers/cuda_12.3.0_windows_network.exe'
    ],
    [
      '12.2.2',
      'https://developer.download.nvidia.com/compute/cuda/12.2.2/network_installers/cuda_12.2.2_windows_network.exe'
    ],
    [
      '12.2.1',
      'https://developer.download.nvidia.com/compute/cuda/12.2.1/network_installers/cuda_12.2.1_windows_network.exe'
    ],
    [
      '12.2.0',
      'https://developer.download.nvidia.com/compute/cuda/12.2.0/network_installers/cuda_12.2.0_windows_network.exe'
    ],
    [
      '12.1.1',
      'https://developer.download.nvidia.com/compute/cuda/12.1.1/network_installers/cuda_12.1.1_windows_network.exe'
    ],
    [
      '12.1.0',
      'https://developer.download.nvidia.com/compute/cuda/12.1.0/network_installers/cuda_12.1.0_windows_network.exe'
    ],
    [
      '12.0.1',
      'https://developer.download.nvidia.com/compute/cuda/12.0.1/network_installers/cuda_12.0.1_windows_network.exe'
    ],
    [
      '12.0.0',
      'https://developer.download.nvidia.com/compute/cuda/12.0.0/network_installers/cuda_12.0.0_windows_network.exe'
    ],
    [
      '11.8.0',
      'https://developer.download.nvidia.com/compute/cuda/11.8.0/network_installers/cuda_11.8.0_windows_network.exe'
    ],
    [
      '11.7.0',
      'https://developer.download.nvidia.com/compute/cuda/11.7.0/network_installers/cuda_11.7.0_windows_network.exe'
    ],
    [
      '11.6.2',
      'https://developer.download.nvidia.com/compute/cuda/11.6.2/network_installers/cuda_11.6.2_windows_network.exe'
    ],
    [
      '11.6.1',
      'https://developer.download.nvidia.com/compute/cuda/11.6.1/network_installers/cuda_11.6.1_windows_network.exe'
    ],
    [
      '11.6.0',
      'https://developer.download.nvidia.com/compute/cuda/11.6.0/network_installers/cuda_11.6.0_windows_network.exe'
    ],
    [
      '11.5.2',
      'https://developer.download.nvidia.com/compute/cuda/11.5.2/network_installers/cuda_11.5.2_windows_network.exe'
    ],
    [
      '11.5.1',
      'https://developer.download.nvidia.com/compute/cuda/11.5.1/network_installers/cuda_11.5.1_windows_network.exe'
    ],
    [
      '11.5.0',
      'https://developer.download.nvidia.com/compute/cuda/11.5.0/network_installers/cuda_11.5.0_win10_network.exe'
    ],
    [
      '11.4.3',
      'https://developer.download.nvidia.com/compute/cuda/11.4.3/network_installers/cuda_11.4.3_win10_network.exe'
    ],
    [
      '11.4.2',
      'https://developer.download.nvidia.com/compute/cuda/11.4.2/network_installers/cuda_11.4.2_win10_network.exe'
    ],
    [
      '11.4.1',
      'https://developer.download.nvidia.com/compute/cuda/11.4.1/network_installers/cuda_11.4.1_win10_network.exe'
    ],
    [
      '11.4.0',
      'https://developer.download.nvidia.com/compute/cuda/11.4.0/network_installers/cuda_11.4.0_win10_network.exe'
    ],
    [
      '11.3.1',
      'https://developer.download.nvidia.com/compute/cuda/11.3.1/network_installers/cuda_11.3.1_win10_network.exe'
    ],
    [
      '11.3.0',
      'https://developer.download.nvidia.com/compute/cuda/11.3.0/network_installers/cuda_11.3.0_win10_network.exe'
    ],
    [
      '11.2.2',
      'https://developer.download.nvidia.com/compute/cuda/11.2.2/network_installers/cuda_11.2.2_win10_network.exe'
    ],
    [
      '11.2.1',
      'https://developer.download.nvidia.com/compute/cuda/11.2.1/network_installers/cuda_11.2.1_win10_network.exe'
    ],
    [
      '11.2.0',
      'https://developer.download.nvidia.com/compute/cuda/11.2.0/network_installers/cuda_11.2.0_win10_network.exe'
    ],
    [
      '11.1.1',
      'https://developer.download.nvidia.com/compute/cuda/11.1.1/network_installers/cuda_11.1.1_win10_network.exe'
    ],
    [
      '11.0.3',
      'https://developer.download.nvidia.com/compute/cuda/11.0.3/network_installers/cuda_11.0.3_win10_network.exe'
    ],
    [
      '10.2.89',
      'https://developer.download.nvidia.com/compute/cuda/10.2/Prod/network_installers/cuda_10.2.89_win10_network.exe'
    ],
    [
      '10.1.243',
      'https://developer.download.nvidia.com/compute/cuda/10.1/Prod/network_installers/cuda_10.1.243_win10_network.exe'
    ],
    [
      '10.0.130',
      'https://developer.nvidia.com/compute/cuda/10.0/Prod/network_installers/cuda_10.0.130_win10_network'
    ],
    [
      '9.2.148',
      'https://developer.nvidia.com/compute/cuda/9.2/Prod2/network_installers2/cuda_9.2.148_win10_network'
    ],
    [
      '8.0.61',
      'https://developer.nvidia.com/compute/cuda/8.0/Prod2/network_installers/cuda_8.0.61_win10_network-exe'
    ]
  ])

  // Private constructor to prevent instantiation
  private constructor() {
    super()
    // Map of cuda SemVer version to download URL
    this.cudaVersionToURL = new Map([
      [
        '12.6.2',
        'https://developer.download.nvidia.com/compute/cuda/12.6.2/local_installers/cuda_12.6.2_560.94_windows.exe'
      ],
      [
        '12.6.1',
        'https://developer.download.nvidia.com/compute/cuda/12.6.1/local_installers/cuda_12.6.1_560.94_windows.exe'
      ],
      [
        '12.6.0',
        'https://developer.download.nvidia.com/compute/cuda/12.6.0/local_installers/cuda_12.6.0_560.76_windows.exe'
      ],
      [
        '12.5.1',
        'https://developer.download.nvidia.com/compute/cuda/12.5.1/local_installers/cuda_12.5.1_555.85_windows.exe'
      ],
      [
        '12.5.0',
        'https://developer.download.nvidia.com/compute/cuda/12.5.0/local_installers/cuda_12.5.0_555.85_windows.exe'
      ],
      [
        '12.4.1',
        'https://developer.download.nvidia.com/compute/cuda/12.4.1/local_installers/cuda_12.4.1_551.78_windows.exe'
      ],
      [
        '12.4.0',
        'https://developer.download.nvidia.com/compute/cuda/12.4.0/local_installers/cuda_12.4.0_551.61_windows.exe'
      ],
      [
        '12.3.2',
        'https://developer.download.nvidia.com/compute/cuda/12.3.2/local_installers/cuda_12.3.2_546.12_windows.exe'
      ],
      [
        '12.3.1',
        'https://developer.download.nvidia.com/compute/cuda/12.3.1/local_installers/cuda_12.3.1_546.12_windows.exe'
      ],
      [
        '12.3.0',
        'https://developer.download.nvidia.com/compute/cuda/12.3.0/local_installers/cuda_12.3.0_545.84_windows.exe'
      ],
      [
        '12.2.2',
        'https://developer.download.nvidia.com/compute/cuda/12.2.2/local_installers/cuda_12.2.2_537.13_windows.exe'
      ],
      [
        '12.2.1',
        'https://developer.download.nvidia.com/compute/cuda/12.2.1/local_installers/cuda_12.2.1_536.67_windows.exe'
      ],
      [
        '12.2.0',
        'https://developer.download.nvidia.com/compute/cuda/12.2.0/local_installers/cuda_12.2.0_536.25_windows.exe'
      ],
      [
        '12.1.1',
        'https://developer.download.nvidia.com/compute/cuda/12.1.1/local_installers/cuda_12.1.1_531.14_windows.exe'
      ],
      [
        '12.1.0',
        'https://developer.download.nvidia.com/compute/cuda/12.1.0/local_installers/cuda_12.1.0_531.14_windows.exe'
      ],
      [
        '12.0.1',
        'https://developer.download.nvidia.com/compute/cuda/12.0.1/local_installers/cuda_12.0.1_528.33_windows.exe'
      ],
      [
        '12.0.0',
        'https://developer.download.nvidia.com/compute/cuda/12.0.0/local_installers/cuda_12.0.0_527.41_windows.exe'
      ],
      [
        '11.8.0',
        'https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_522.06_windows.exe'
      ],
      [
        '11.7.0',
        'https://developer.download.nvidia.com/compute/cuda/11.7.0/local_installers/cuda_11.7.0_516.01_windows.exe'
      ],
      [
        '11.6.2',
        'https://developer.download.nvidia.com/compute/cuda/11.6.2/local_installers/cuda_11.6.2_511.65_windows.exe'
      ],
      [
        '11.6.1',
        'https://developer.download.nvidia.com/compute/cuda/11.6.1/local_installers/cuda_11.6.1_511.65_windows.exe'
      ],
      [
        '11.6.0',
        'https://developer.download.nvidia.com/compute/cuda/11.6.0/local_installers/cuda_11.6.0_511.23_windows.exe'
      ],
      [
        '11.5.2',
        'https://developer.download.nvidia.com/compute/cuda/11.5.2/local_installers/cuda_11.5.2_496.13_windows.exe'
      ],
      [
        '11.5.1',
        'https://developer.download.nvidia.com/compute/cuda/11.5.1/local_installers/cuda_11.5.1_496.13_windows.exe'
      ],
      [
        '11.5.0',
        'https://developer.download.nvidia.com/compute/cuda/11.5.0/local_installers/cuda_11.5.0_496.13_win10.exe'
      ],
      [
        '11.4.3',
        'https://developer.download.nvidia.com/compute/cuda/11.4.3/local_installers/cuda_11.4.3_472.50_win10.exe'
      ],
      [
        '11.4.2',
        'https://developer.download.nvidia.com/compute/cuda/11.4.2/local_installers/cuda_11.4.2_471.41_win10.exe'
      ],
      [
        '11.4.1',
        'https://developer.download.nvidia.com/compute/cuda/11.4.1/local_installers/cuda_11.4.1_471.41_win10.exe'
      ],
      [
        '11.4.0',
        'https://developer.download.nvidia.com/compute/cuda/11.4.0/local_installers/cuda_11.4.0_471.11_win10.exe'
      ],
      [
        '11.3.1',
        'https://developer.download.nvidia.com/compute/cuda/11.3.1/local_installers/cuda_11.3.1_465.89_win10.exe'
      ],
      [
        '11.3.0',
        'https://developer.download.nvidia.com/compute/cuda/11.3.0/local_installers/cuda_11.3.0_465.89_win10.exe'
      ],
      [
        '11.2.2',
        'https://developer.download.nvidia.com/compute/cuda/11.2.2/local_installers/cuda_11.2.2_461.33_win10.exe'
      ],
      [
        '11.2.1',
        'https://developer.download.nvidia.com/compute/cuda/11.2.1/local_installers/cuda_11.2.1_461.09_win10.exe'
      ],
      [
        '11.2.0',
        'https://developer.download.nvidia.com/compute/cuda/11.2.0/local_installers/cuda_11.2.0_460.89_win10.exe'
      ],
      [
        '11.1.1',
        'https://developer.download.nvidia.com/compute/cuda/11.1.1/local_installers/cuda_11.1.1_456.81_win10.exe'
      ],
      [
        '11.0.3',
        'https://developer.download.nvidia.com/compute/cuda/11.0.3/local_installers/cuda_11.0.3_451.82_win10.exe'
      ],
      [
        '10.2.89',
        'https://developer.download.nvidia.com/compute/cuda/10.2/Prod/local_installers/cuda_10.2.89_441.22_win10.exe'
      ],
      [
        '10.1.243',
        'https://developer.download.nvidia.com/compute/cuda/10.1/Prod/local_installers/cuda_10.1.243_426.00_win10.exe'
      ],
      [
        '10.0.130',
        'https://developer.nvidia.com/compute/cuda/10.0/Prod/local_installers/cuda_10.0.130_411.31_win10'
      ],
      [
        '9.2.148',
        'https://developer.nvidia.com/compute/cuda/9.2/Prod2/local_installers2/cuda_9.2.148_win10'
      ],
      [
        '8.0.61',
        'https://developer.nvidia.com/compute/cuda/8.0/Prod2/local_installers/cuda_8.0.61_win10-exe'
      ]
    ])
    this.cudnnVersionToURL = new Map([
      [
        '8.5.0',
        new Map([
          [
            10,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.5.0.96_cuda10-archive.zip'
          ],
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.5.0.96_cuda11-archive.zip'
          ]
        ])
      ],
      [
        '8.6.0',
        new Map([
          [
            10,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.6.0.163_cuda10-archive.zip'
          ],
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.6.0.163_cuda11-archive.zip'
          ]
        ])
      ],
      [
        '8.7.0',
        new Map([
          [
            10,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.7.0.84_cuda10-archive.zip'
          ],
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.7.0.84_cuda11-archive.zip'
          ]
        ])
      ],
      [
        '8.8.0',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.8.0.121_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.8.0.121_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.8.1',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.8.1.3_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.8.1.3_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.0',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.0.131_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.0.131_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.1',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.1.23_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.1.23_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.2',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.2.26_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.2.26_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.3',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.3.28_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.3.28_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.4',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.4.25_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.4.25_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.5',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.5.30_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.5.30_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.6',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.6.50_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.6.50_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '8.9.7',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.7.29_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-8.9.7.29_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '9.0.0',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.0.0.312_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.0.0.312_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '9.1.0',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.1.0.70_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.1.0.70_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '9.1.1',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.1.1.17_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.1.1.17_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '9.2.0',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.2.0.82_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.2.0.82_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '9.2.1',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.2.1.18_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.2.1.18_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '9.3.0',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.3.0.75_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.3.0.75_cuda12-archive.zip'
          ]
        ])
      ],
      [
        '9.4.0',
        new Map([
          [
            11,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.4.0.58_cuda11-archive.zip'
          ],
          [
            12,
            'https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.4.0.58_cuda12-archive.zip'
          ]
        ])
      ]
    ])
  }

  static get Instance(): WindowsLinks {
    return this._instance || (this._instance = new this())
  }

  getAvailableNetworkCudaVersions(): SemVer[] {
    return Array.from(this.cudaVersionToNetworkUrl.keys()).map(
      s => new SemVer(s)
    )
  }

  getNetworkURLFromCudaVersion(version: SemVer): URL {
    const urlString = this.cudaVersionToNetworkUrl.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }
}
