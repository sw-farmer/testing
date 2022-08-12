
import * as THREE from 'three';
import { OrbitControls } from "https://unpkg.com/three@0.141.0/examples/jsm/controls/OrbitControls.js"
import { FBXLoader } from "https://unpkg.com/three@0.141.0/examples/jsm/loaders/FBXLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.141.0/examples/jsm/loaders/RGBELoader.js";



class App {
    constructor() {
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true} );
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2;

        const scene = new THREE.Scene();
        this._scene = scene;

        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupControls();
        this._setupBackground();


        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));
    }

    _setupControls() {
		this._controls = new OrbitControls(this._camera, this._divContainer);
	}


    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            75,
            width/height,
            0.1,
            100
        );
        camera.position.z = 2;
        this._camera = camera;
    }

    // _setupLight() {
    // const color = 0xffffff;
    // const intensity = 1;
    // const light = new THREE.DirectionalLight(color, intensity);
    // light.position.set(-1, 2, 4);
    // this._scene.add(light);
    // }

    _setupLight() {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this._scene.add(light);
    }

    _setupBackground() {
        this._scene.background = new THREE.Color("#FFFFFF")
        // this._scene.fog = new THREE.Fog("#FFFFFF", 0, 140);

        new RGBELoader().load("./data/texture/wide_street_02_4k.hdr", (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            // this._scene.background = texture;
            this._scene.environment = texture;
        })
    }

    _zoomFit(object3D, camera, viewMode, bFront) {
        const box = new THREE.Box3().setFromObject(object3D);
        const sizeBox = box.getSize(new THREE.Vector3()).length();
        const centerBox = box.getCenter(new THREE.Vector3());

        let offsetX = 0, offsetY = 0, offsetZ = 0;
        viewMode === "X" ? offsetX = 1 : (viewMode === "Y") ? 
            offsetY = 1: offsetZ = 1;

        if(!bFront){
            offsetX *= -1;
            offsetY *= -1;
            offsetZ *= -1;
        }
        camera.position.set(
            centerBox.x + offsetX, centerBox.y + offsetY, centerBox.z + offsetZ);

        const halfSizeModel = sizeBox * .5;
        const halfFov = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeModel / Math.tan(halfFov);
        const direction = (new THREE.Vector3()).subVectors(
            camera.position, centerBox).normalize();
        const position = direction.multiplyScalar(distance).add(centerBox);

        camera.position.copy(position);
        camera.near = sizeBox / 100;
        camera.far = sizeBox * 100;
        camera.updateProjectionMatrix();
        camera.lookAt(centerBox.x, centerBox.y, centerBox.z);

        this._controls.target.set(centerBox.x, centerBox.y, centerBox.z);
    }

    _setupModel() {
        const loader = new FBXLoader();
        loader.setResourcePath( './data/texture/' );
        loader.load('./data/wanwalcho.fbx', object => {
            this._scene.add(object);

            this._zoomFit(object, this._camera, "Z", true);
        });
       
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        
        this._camera.aspect = width/height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
    }
    
    render(time) {
        this._renderer.render(this._scene, this._camera);
        this.update(time);
        requestAnimationFrame(this.render.bind(this));
    }

    update(time) {
        time *=0.001; //second unit
    }

}

window.onload = function() {
    new App();
}