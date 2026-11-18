Add-Type -AssemblyName System.Drawing

$srcPath = "D:\Dhaka City\branding\dhaka-city-gangstar-icon-master.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$sizes = @(192, 512)
foreach ($s in $sizes) {
    $dest = New-Object System.Drawing.Bitmap($s, $s, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($src, 0, 0, $s, $s)
    $outFile = "D:\Dhaka City\public\pwa-icon-$s.png"
    $dest.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    Write-Host "Created $outFile"
}

$src.Dispose()
