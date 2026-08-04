# 캡처한 PNG을 해당 디스플레이의 ICC 프로파일 기준으로 sRGB에 매칭시킨다.
# mac의 `sips --matchTo sRGB`에 대응하는 Windows 버전 (WIC/ColorContext 사용).
param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][string]$DeviceName
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName PresentationCore
Add-Type -Namespace ColorPick -Name Native -MemberDefinition @"
[System.Runtime.InteropServices.DllImport("gdi32.dll", CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
public static extern System.IntPtr CreateDC(string lpszDriver, string lpszDevice, string lpszOutput, System.IntPtr lpInitData);

[System.Runtime.InteropServices.DllImport("gdi32.dll")]
public static extern bool DeleteDC(System.IntPtr hdc);

[System.Runtime.InteropServices.DllImport("mscms.dll", CharSet = System.Runtime.InteropServices.CharSet.Unicode, SetLastError = true)]
public static extern bool GetICMProfile(System.IntPtr hdc, ref uint pBufSize, System.Text.StringBuilder pszFilename);
"@

$hdc = [ColorPick.Native]::CreateDC("DISPLAY", $DeviceName, $null, [System.IntPtr]::Zero)
if ($hdc -eq [System.IntPtr]::Zero) { throw "CreateDC failed for $DeviceName" }

try {
  $bufSize = [uint32]260
  $sb = New-Object System.Text.StringBuilder 260
  if (-not [ColorPick.Native]::GetICMProfile($hdc, [ref]$bufSize, $sb)) {
    throw "GetICMProfile failed for $DeviceName"
  }
  $profileName = $sb.ToString()
}
finally {
  [ColorPick.Native]::DeleteDC($hdc) | Out-Null
}

$profilePath = Join-Path "$env:SystemRoot\System32\spool\drivers\color" $profileName
if (-not (Test-Path $profilePath)) { throw "ICC profile not found: $profilePath" }

$srcContext = New-Object System.Windows.Media.ColorContext($profilePath)
$dstContext = New-Object System.Windows.Media.ColorContext([System.Windows.Media.PixelFormats]::Bgra32)

$inStream = [System.IO.File]::OpenRead($InputPath)
try {
  $decoder = New-Object System.Windows.Media.Imaging.PngBitmapDecoder(
    $inStream,
    [System.Windows.Media.Imaging.BitmapCreateOptions]::None,
    [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
  )
  $converted = New-Object System.Windows.Media.Imaging.ColorConvertedBitmap(
    $decoder.Frames[0], $srcContext, $dstContext, [System.Windows.Media.PixelFormats]::Bgra32
  )

  $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($converted))

  $outStream = [System.IO.File]::OpenWrite($OutputPath)
  try {
    $encoder.Save($outStream)
  }
  finally {
    $outStream.Close()
  }
}
finally {
  $inStream.Close()
}
