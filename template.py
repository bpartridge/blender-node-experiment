
import sys

try:
  bpy.data.images['strapimage'].filepath = "//{{strapimage}}"
  bpy.data.images['bodyimage'].filepath = "//{{bodyimage}}"
except:
  sys.exit(1)
