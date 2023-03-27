# $xa = 9
# $ya = 4
# $xb = 9
# $yb = 5

# for ($size = 4; $size -lt 11; $size++ ){
#     for($i = $xa; $i -le $xb; $i++) {
#         for($j = $ya; $j -le $yb; $j++) {
#             $dest = Join-Path $pwd 'cached2'
#             # Rest of the code goes here
#             Write-Host "https://b.tile.openstreetmap.org/$size/$i/$j.png"
#             Invoke-WebRequest -UseBasicParsing -Uri "https://b.tile.openstreetmap.org/$size/$i/$j.png" -OutFile "k_file_$size_$i_$j.png"       
#         }
#     }
#     $xa = $xa * 2
#     $xb = $xb * 2
#     $ya = $ya * 2
#     $yb = $yb * 2    
# }

# // 4: 9 4 9 5
# // 5: 19 9 19 10
# // 6: 38 19 38 20
# // 7: 77 39 77 40
# // 8: 154 79 155 80
# // 9: 



$xa = 38100
$ya = 76568
$xb = 38108
$yb = 76575
    
for ($size = 17; $size -lt 18; $size++ ){
    Write-Host "s"
    for($i = $xa; $i -le $xb; $i++) {
             Write-Host " i"
             for($j = $ya; $j -le $yb; $j++) {
                 Write-host "  j"
                 $dest = Join-Path $pwd 'cached2'
                 # Rest of the code goes here
                 Write-Host "https://b.tile.openstreetmap.org/$size/$i/$j.png"
                 Invoke-WebRequest -UseBasicParsing -Uri "https://b.tile.openstreetmap.org/$size/$i/$j.png" -OutFile ("m_file_"+$size+"_"+$i+"_"+$j+".png")
                 Invoke-WebRequest -UseBasicParsing -Uri "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/$size/$j/$i" -OutFile ("m_file_"+$size+"_"+$i+"_"+$j+"_sat.png")
             }
         }
         $xa = $xa * 2
         $xb = $xb * 2
         $ya = $ya * 2
         $yb = $yb * 2
}