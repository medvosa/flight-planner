$zoom = 2
$maxIndex = [Math]::Pow(2, $zoom)
for($i = 0; $i -lt $zoom; $i++) {
    for($j = 0; $j -lt $zoom; $j++) {
        $dest = Join-Path $pwd 'cached'
        # Rest of the code goes here
        Write-Host "https://b.tile.openstreetmap.org/$zoom/$i/$j.png"
        Invoke-WebRequest -UseBasicParsing -Uri "https://b.tile.openstreetmap.org/$zoom/$i/$j.png" -OutFile "file_$zoom_$i_$j.png"
        
    }
}
