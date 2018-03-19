var shades ={
	simplefs:
    	"precision mediump float;\n\
    	varying vec4 vColor;\n\
    	varying vec2 tc;\n\
		uniform sampler2D tex0;\n\
		uniform sampler2D tex1;\n\
		uniform float usetex;\n\
		\n\
    	void main(void) {\n\
    		vec4 tt = texture2D(tex0,tc);\n\
        	gl_FragColor = vec4(mix(vec3(1.),tt.rgb,usetex)*vColor.rgb*vec3(tt.a*vColor.a),vColor.a*tt.a);\n\
    	}",
	simplevs:
	    "attribute vec3 pos;\n\
	    attribute vec4 color;\n\
	    attribute vec2 texcoord;\n\
	    \n\
	    uniform vec2 tscale;\n\
	    uniform vec2 toffset;\n\
	    uniform vec2 pscale;\n\
	    uniform vec2 ptranslate;\n\
	    uniform vec4 pcolor;\n\
		\n\
    	varying vec4 vColor;\n\
    	varying vec2 tc;\n\
		\n\
    	void main(void) {\n\
        	gl_Position = vec4(pos*vec3(pscale.xy,1.)+vec3(ptranslate.xy,0.),1.);\n\
        	vColor = color*pcolor;\n\
        	vec2 ttt = ((texcoord*2.-vec2(1.))*tscale+toffset)*0.5+vec2(0.5);\n\
        	tc= ttt;\n\
    	}",
     basevs:
     	"attribute vec3 pos;\n\
     	attribute vec4 color;\n\
     	attribute vec2 texcoord;\n\
     	varying vec4 vColor;\n\
     	varying vec2 tc;\n\
     	\n\
     	void main(void){\n\
     		gl_Position = vec4(pos,1);\n\
     		tc = texcoord;\n\
     		vColor = color;\n\
     	}",
     basefs:
    	"precision mediump float;\n\
    	varying vec4 vColor;\n\
    	varying vec2 tc;\n\
		uniform sampler2D tex0;\n\
		uniform sampler2D tex1;\n\
		\n\
    	void main(void) {\n\
        	gl_FragColor = texture2D(tex0,tc);\n\
    	}",
		testfs:
    	"precision mediump float;\n\
    	varying vec4 vColor;\n\
    	varying vec2 tc;\n\
		//uniform sampler2D tex0;\n\
		//uniform sampler2D tex1;\n\
		\n\
    	void main(void) {\n\
        	gl_FragColor = vColor;\n\
    	}",
    skinfs:
    	"precision mediump float;\n\
    	varying vec4 vColor;\n\
    	varying vec2 tc;\n\
		uniform sampler2D tex0;\n\
		\n\
    	void main(void) {\n\
        	gl_FragColor = texture2D(tex0,tc)*vColor;\n\
    	}",
    skinvs:
    	"precision mediump float;\n\
    	attribute vec3 pos;\n\
		attribute vec4 color;\n\
		attribute vec2 texcoord;\n\
		varying vec2 tc;\n\
		varying vec4 vColor;\n\
		uniform vec4 p1;\n\
		uniform vec4 p2;\n\
		uniform vec4 p3;\n\
		uniform vec4 p4;\n\
		uniform vec4 theta;\n\
		uniform vec4 size;\n\
		uniform vec4 falloff;\n\
		void main()\n\
		{\n\
    		tc = texcoord;\n\
    		vec2 posi = pos.xy;\n\
    		vec4 falls = falloff*size;\n\
    		vec4 pval = vec4(smoothstep(size.x+falls.x,size.x-falls.x,length(posi-p1.xy)),0.,0.,0.);\n\
    		pval.y = smoothstep(size.y+falls.y,size.y-falls.y,length(posi-p2.xy));\n\
    		pval.z = smoothstep(size.y+falls.y,size.y-falls.y,length(posi-p3.xy));\n\
    		pval.w = smoothstep(size.y+falls.y,size.y-falls.y,length(posi-p4.xy));\n\
    		vec4 cosp = cos(theta);\n\
    		vec4 sinp = sin(theta);\n\
    		vec2 t1 = mix(posi,((posi-p1.xy)*mat2(cosp.x,sinp.x,-sinp.x,cosp.x)+p1.xy+p1.zw),pval.x);\n\
    		vec2 t2 = mix(t1,((t1-p2.xy)*mat2(cosp.y,sinp.y,-sinp.y,cosp.y)+p2.xy+p2.zw),pval.y);\n\
    		vec2 t3 = mix(t2,((t2-p3.xy)*mat2(cosp.z,sinp.z,-sinp.z,cosp.z)+p3.xy+p3.zw),pval.z);\n\
    		vec2 t4 = mix(t3,((t3-p4.xy)*mat2(cosp.w,sinp.w,-sinp.w,cosp.w)+p4.xy+p4.zw),pval.w);\n\
    		vColor = color;\n\
			gl_Position = vec4(t4,0.,1.);\n\
		}",
		gridfs:
			"#extension GL_EXT_shader_texture_lod : enable\n\
			#extension GL_OES_standard_derivatives : enable\n\
			\n\
			precision mediump float;\n\
    		varying vec4 vColor;\n\
    		varying vec2 tc;\n\
			uniform sampler2D tex0;\n\
			uniform float xfade;\n\
			\n\
			void main()\n\
			{   \n\
				vec4 a = texture2D(tex0, tc);\n\
				// output texture\n\
    			float distx = step(abs(0.5-mod(tc.x*25.,1.)),0.5-xfade*fwidth(tc.x));\n\
    			float disty = step(abs(0.5-mod(tc.y*25.,1.)),0.5-xfade*fwidth(tc.y));\n\
				gl_FragColor = vColor*vec4(0.,0.,0.,1.-distx*disty);\n\
			}"
};
