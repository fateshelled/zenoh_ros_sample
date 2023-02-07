const colors = {
    "RED": 0xFF0000,
    "GREEN": 0x00FF00,
    "BLUE": 0x0000FF,
    "CYAN": 0x00FFFF,
    "YELLOW": 0xFFFF00,
    "MAGENTA": 0xFF00FF,
    "GRAY": 0x999999,
    "LIGHTGRAY": 0xDDDDDD,
}

function createLine(x0, y0, z0, x1, y1, z1, color="RED"){
    const points = [];
    points.push(new THREE.Vector3(x0, y0, z0));
    points.push(new THREE.Vector3(x1, y1, z1));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color: colors[color]});
    const line = new THREE.Line(geometry, material);
    return line
}

function createPoint(x, y, z, size=1, color="RED"){
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([x, y, z], 3));

    const material = new THREE.PointsMaterial({size: size, color: colors[color]});
    const point = new THREE.Points(geometry, material);
    return point;
}


class GUI {
    constructor(canvas_id, width=960, height=640){
        this.scene = new THREE.Scene();
        this.width = width;
        this.height = height;
        this.canvas_id = canvas_id;
        this.objects = {};
    }
    init(){
        const scene = this.scene;

        const canvas = document.getElementById(this.canvas_id);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.width, this.height);

        const camera = new THREE.PerspectiveCamera(45, this.width / this.height);
        camera.position.set(0, 0, +10);

        // guriguri
        const controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.2;

        tick();

        function tick() {
            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        }
    }
    tick(){
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.tick);

    }
    drawLaserScan(name, scan){
        let group = null;
        if (name in this.objects){
            group = this.objects[name];
            for (let i = 0; i < group.children.length; ++i) {
                group.children[i].geometry.dispose();
                group.children[i].material.dispose();
                group.remove(group.children[i])
            }
        }else{
            group = new THREE.Group();
            this.objects[name] = group;
            this.scene.add(group);
        }

        let angle = scan.angle_min;
        for (const range of scan.ranges) {
            var r = range;
            var isInRange = true;
            if (range > scan.range_max) {
                r = scan.range_max;
                isInRange = false;
            } else if (range < scan.range_min) {
                r = scan.range_min;
                isInRange = false;
            }
            const x = -r * Math.sin(angle);
            const y = -r * Math.cos(angle);
            angle += scan.angle_increment;

            let color = 0xdcdcdc;
            if (isInRange) {
                color = 0xd3d3d3;
                let p = createPoint(x, y, 0, 0.1, "RED");
                group.add(p)
            }
            let line = createLine(0, 0, 0, x, y, 0, color);
            group.add(line);
        }
        return;
    }
}
