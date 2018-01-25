import {vec2, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Speed' : 1.0,
  'Pause' : false,
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let time = 0;
let time2 = 0;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, 8);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}



function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  //const text = new GUIText();
  //gui.add(controls, 'Shader', [ 'Lambert', 'Custom1', 'Custom2'] );
  gui.add(controls, 'Speed', 1, 3).step(0.05);
  gui.add(controls, 'Pause', false );


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();
  let cam_scale = 2.0;
  let camx = 0.7 * cam_scale;
  let camy = -0.7 * cam_scale;
  let camz = 2.3;
  const camera = new Camera(vec3.fromValues(camx,camy,camz), vec3.fromValues(-0.5, -0.25, 0.75));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const customShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
  ]);

  const customShader2 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom2-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom2-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    time2++;
    if(!controls.Pause) {
      time++;
    }

    let cycle = 300.0/controls.Speed;

      let v4 = vec4.fromValues(time/cycle,time%cycle,time2%cycle,cycle);
      customShader2.setTime(v4);
      renderer.render(camera, customShader2, [
        //icosphere,
        square,
        //cube,
      ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    let w = vec2.fromValues(window.innerWidth, window.innerHeight);
    customShader2.setWindow(w);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  let w = vec2.fromValues(window.innerWidth, window.innerHeight);
  customShader2.setWindow(w);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}


main();
