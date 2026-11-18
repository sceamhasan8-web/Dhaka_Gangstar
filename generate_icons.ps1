Add-Type -AssemblyName System.Drawing

$masterPath = "D:\Dhaka City\dhaka-city-gangstar-icon-master.png"
if (-not (Test-Path $masterPath)) {
    Write-Error "Master icon not found: $masterPath"
    exit 1
}

$masterBmp = [System.Drawing.Bitmap]::FromFile($masterPath)

$densities = @(
    @{ Name = "mipmap-mdpi"; StandardSize = 48; ForegroundSize = 108 },
    @{ Name = "mipmap-hdpi"; StandardSize = 72; ForegroundSize = 162 },
    @{ Name = "mipmap-xhdpi"; StandardSize = 96; ForegroundSize = 216 },
    @{ Name = "mipmap-xxhdpi"; StandardSize = 144; ForegroundSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; StandardSize = 192; ForegroundSize = 432 }
)

$resDir = "D:\Dhaka City\android\app\src\main\res"

function Resize-Bitmap($src, $w, $h) {
    $dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
    return $dest
}

function Create-CircularBitmap($src, $size) {
    $dest = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $g.SetClip($path)
    $g.DrawImage($src, 0, 0, $size, $size)
    $path.Dispose()
    $g.Dispose()
    return $dest
}

function Create-AdaptiveForeground($src, $canvasSize) {
    $dest = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # In Android adaptive icons, safe viewport is centered 66-72%
    $contentSize = [int]($canvasSize * 0.72)
    $offset = [int](($canvasSize - $contentSize) / 2)

    $g.DrawImage($src, $offset, $offset, $contentSize, $contentSize)
    $g.Dispose()
    return $dest
}

function Create-MonochromeIcon($src, $canvasSize) {
    $fg = Create-AdaptiveForeground $src $canvasSize
    $dest = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt $canvasSize; $y++) {
        for ($x = 0; $x -lt $canvasSize; $x++) {
            $px = $fg.GetPixel($x, $y)
            if ($px.A -gt 20) {
                # Grayscale luminance
                $lum = [int](0.299 * $px.R + 0.587 * $px.G + 0.114 * $px.B)
                $dest.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($px.A, $lum, $lum, $lum))
            } else {
                $dest.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            }
        }
    }
    $fg.Dispose()
    return $dest
}

foreach ($d in $densities) {
    $folder = Join-Path $resDir $d.Name
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    Write-Host "Generating $($d.Name)..."

    # 1. Standard Launcher Icon
    $std = Resize-Bitmap $masterBmp $d.StandardSize $d.StandardSize
    $std.Save((Join-Path $folder "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $std.Dispose()

    # 2. Round Launcher Icon
    $round = Create-CircularBitmap $masterBmp $d.StandardSize
    $round.Save((Join-Path $folder "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $round.Dispose()

    # 3. Adaptive Foreground Icon
    $fg = Create-AdaptiveForeground $masterBmp $d.ForegroundSize
    $fg.Save((Join-Path $folder "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $fg.Dispose()

    # 4. Monochrome Icon
    $mono = Create-MonochromeIcon $masterBmp $d.ForegroundSize
    $mono.Save((Join-Path $folder "ic_launcher_monochrome.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $mono.Dispose()
}

# Update Splash screens with Master Image
$splashDestinations = @(
    "drawable\splash.png",
    "drawable-land-mdpi\splash.png",
    "drawable-land-hdpi\splash.png",
    "drawable-land-xhdpi\splash.png",
    "drawable-land-xxhdpi\splash.png",
    "drawable-land-xxxhdpi\splash.png"
)

foreach ($rel in $splashDestinations) {
    $destFile = Join-Path $resDir $rel
    if (Test-Path (Split-Path $destFile)) {
        $splashBmp = Resize-Bitmap $masterBmp 1280 720
        $splashBmp.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
        $splashBmp.Dispose()
    }
}

$masterBmp.Dispose()
Write-Host "All Android icons and splash assets successfully generated!"

