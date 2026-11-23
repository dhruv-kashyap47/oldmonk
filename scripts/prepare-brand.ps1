# Derives web assets from the supplied brand files in assets/logo/.
# Source art is never modified. Run: pwsh -File scripts/prepare-brand.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "public\brand"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Get-ContentBox {
  param([System.Drawing.Bitmap]$Bitmap, [int]$Threshold = 18, [int]$Step = 3)

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = 0
  $maxY = 0

  for ($y = 0; $y -lt $Bitmap.Height; $y += $Step) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += $Step) {
      $c = $Bitmap.GetPixel($x, $y)
      $bright = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
      if ($bright -gt $Threshold) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -le $minX -or $maxY -le $minY) {
    return [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
  }

  $pad = [Math]::Max($Step * 2, [int]([Math]::Round([Math]::Max($Bitmap.Width, $Bitmap.Height) * 0.02)))
  $x0 = [Math]::Max(0, $minX - $pad)
  $y0 = [Math]::Max(0, $minY - $pad)
  $w = [Math]::Min($Bitmap.Width - $x0, ($maxX - $minX) + ($pad * 2))
  $h = [Math]::Min($Bitmap.Height - $y0, ($maxY - $minY) + ($pad * 2))
  return [System.Drawing.Rectangle]::new($x0, $y0, $w, $h)
}

function Save-Resized {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Width,
    [int]$Height,
    [string]$Path
  )

  $target = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($target)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($Bitmap, 0, 0, $Width, $Height)
  $g.Dispose()
  $target.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $target.Dispose()
}

# Lockup: monk plus wordmark. Cropped to content, 120px tall for a 40px header at 3x.
$lockupSrc = New-Object System.Drawing.Bitmap (Join-Path $root "assets\logo\main-logo.png")
$lockupBox = Get-ContentBox -Bitmap $lockupSrc
$lockup = $lockupSrc.Clone($lockupBox, $lockupSrc.PixelFormat)
$lockupH = 120
$lockupW = [int][Math]::Round($lockup.Width * ($lockupH / $lockup.Height))
Save-Resized -Bitmap $lockup -Width $lockupW -Height $lockupH -Path (Join-Path $outDir "oldmonk-logo.png")

# Mark: the rounded dark tile. Emitted at every size the site declares.
$markSrc = New-Object System.Drawing.Bitmap (Join-Path $root "assets\logo\main-favicon.png")
$markBox = Get-ContentBox -Bitmap $markSrc
$mark = $markSrc.Clone($markBox, $markSrc.PixelFormat)

$sizes = @(
  @{ Name = "icon-512.png"; Size = 512 },
  @{ Name = "icon-192.png"; Size = 192 },
  @{ Name = "apple-touch-icon.png"; Size = 180 },
  @{ Name = "mark-128.png"; Size = 128 },
  @{ Name = "favicon-64.png"; Size = 64 },
  @{ Name = "favicon-32.png"; Size = 32 }
)

foreach ($entry in $sizes) {
  Save-Resized -Bitmap $mark -Width $entry.Size -Height $entry.Size -Path (Join-Path $outDir $entry.Name)
}

# Social card: the source art itself, scaled to cover 1200x630. No pasted seam.
$card = New-Object System.Drawing.Bitmap 1200, 630, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($card)
$g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$coverScale = [Math]::Max(1200 / $lockupSrc.Width, 630 / $lockupSrc.Height)
$coverW = [int][Math]::Round($lockupSrc.Width * $coverScale)
$coverH = [int][Math]::Round($lockupSrc.Height * $coverScale)
$g.DrawImage($lockupSrc, [int]((1200 - $coverW) / 2), [int]((630 - $coverH) / 2), $coverW, $coverH)
$g.Dispose()
$card.Save((Join-Path $outDir "og-default.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$card.Dispose()

"lockup ${lockupW}x${lockupH} from $($lockupBox.Width)x$($lockupBox.Height)"
"mark $($markBox.Width)x$($markBox.Height)"
Get-ChildItem $outDir | Select-Object Name, Length

$lockup.Dispose(); $lockupSrc.Dispose(); $mark.Dispose(); $markSrc.Dispose()
