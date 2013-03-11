ARCH=`uname -m`

all: blender/blender

blender:
	mkdir -p blender

blender/blender.tar.bz2: blender
	curl -o $@ "https://s3.amazonaws.com/stitchyourstory-blender/blender-2.66a-linux-glibc211-${ARCH}.tar.bz2"

blender/blender: blender/blender.tar.bz2
	tar --strip-components=1 -C blender -xjf $<
	rm $<
