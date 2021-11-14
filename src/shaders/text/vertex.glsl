void main(){
    const modelPosition = modelMatrix * vec4(position, 1.0);
    const viewPosition = viewMatrix * modelPosition;
    const projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}