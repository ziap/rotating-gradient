async function compile_shader(gl, url, type) {
  const code = await (await fetch(url)).text()
  const shader = gl.createShader(type)

  gl.shaderSource(shader, code)
  gl.compileShader(shader)

  return shader
}

async function compile_program(gl) {
  const program = gl.createProgram()
  const vertex_shader = await compile_shader(gl, "./shader.vert", gl.VERTEX_SHADER)
  const fragment_shader = await compile_shader(gl, "./shader.frag", gl.FRAGMENT_SHADER)

  gl.attachShader(program, vertex_shader)
  gl.attachShader(program, fragment_shader)
  gl.linkProgram(program)

  return program
}

function create_buffer(gl, location, data) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.flat()), gl.STATIC_DRAW)

  gl.vertexAttribPointer(location, data[0].length || 1, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(location)
}

function to_rgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1,
  ]
}

async function init() {
  const canvas = document.querySelector('canvas')
  const [picker1, picker2] = document.querySelectorAll('input[type=color]')

  const aspect_ratio = canvas.width / canvas.height

  const gl = canvas.getContext('webgl')
  const program = await compile_program(gl)

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clearColor(0, 0, 0, 1)
  gl.useProgram(program)

  let current_angle = 0
  let last = performance.now()

  const vertexs = [
    [1, 1], [-1, 1], [1, -1], [-1, -1]
  ]
  create_buffer(gl, gl.getAttribLocation(program, "a_vertex"), vertexs)

  const frame = () => {
    const current = performance.now()
    current_angle += (current - last) * (Math.PI / 2) / 1000
    last = current

    gl.clear(gl.COLOR_BUFFER_BIT)

    const scale = 0.75 + 0.25 * Math.sin(current_angle)
    const current_scale = [scale, scale * aspect_ratio]

    const u_scale = gl.getUniformLocation(program, "u_scale")
    gl.uniform2fv(u_scale, current_scale)

    const u_color1 = gl.getUniformLocation(program, "u_color1")
    gl.uniform4fv(u_color1, to_rgb(picker1.value))
    const u_color2 = gl.getUniformLocation(program, "u_color2")
    gl.uniform4fv(u_color2, to_rgb(picker2.value))

    const sin_x = Math.sin(current_angle)
    const cos_x = Math.cos(current_angle)

    const interp = [
      -sin_x,
      -cos_x,
      cos_x,
      sin_x
    ]

    create_buffer(gl, gl.getAttribLocation(program, "a_interp"), interp)

    const vertex_count = vertexs.length

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertex_count)
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}

init()
