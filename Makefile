debug:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/regl.min.js

build:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/regl.min.js
	uglifyjs build/regl.min.js -c -m --in-situ

.PHONY: build debug
