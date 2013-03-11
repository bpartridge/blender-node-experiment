
try:
  bpy.data.images['strapimage'].filepath = "//{{strapimage}}"
  bpy.data.images['bodyimage'].filepath = "//{{bodyimage}}"
except Exception as e:
  print "Error:", e.strerror
