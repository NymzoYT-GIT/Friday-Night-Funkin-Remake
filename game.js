"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

document.body.innerHTML = "";

document.body.style.cssText = `
  margin: 0;
  background: #111;
  color: white;
  font-family: Arial, sans-serif;
`;

if (!canvas || !ctx) {
  document.body.innerHTML =
    "<h1>ERROR: Canvas could not be created.</h1>";
} else {
  canvas.style.cssText = `
    display: block;
    width: 100%;
    height: 100%;
  `;

  document.body.appendChild(canvas);

  canvas.width = 800;
  canvas.height = 450;

  ctx.fillStyle = "#19162e";
  ctx.fillRect(0, 0, 800, 450);

  ctx.fillStyle = "#ec008c";
  ctx.fillRect(100, 100, 600, 250);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    "FRIDAY NIGHT FUNKIN'",
    400,
    200
  );

  ctx.font = "22px Arial";
  ctx.fillStyle = "#00d9ff";

  ctx.fillText(
    "JAVASCRIPT IS WORKING!",
    400,
    250
  );
}
