
import bpy

def z_stretch_obj(obj, factor):
  vs = obj.data.vertices
  minz = min([v.co.z for v in vs])
  for v in vs:
    dz = v.co.z - minz
    v.co.z = dz * factor + minz

try:
  z_stretch_obj(bpy.data.objects['strap'], float("{{straplen}}" or 1))
  bpy.data.images['strapimage'].filepath = "//{{strapimage}}"
  bpy.data.images['bodyimage'].filepath = "//{{bodyimage}}"
except Exception as e:
  print(e)
