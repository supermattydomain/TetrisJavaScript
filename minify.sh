#!/bin/sh

for ext in js css ; do
	for f in $(ls -1 *.$ext |fgrep -v min) ; do
		b=`basename "$f" ".$ext"`
		yui-compressor -o "${b}.min.${ext}" "$f"
	done
done
