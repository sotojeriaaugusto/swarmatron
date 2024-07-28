document.addEventListener("DOMContentLoaded", () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let gainNode = audioContext.createGain();
  let oscillators = [];
  let isPlaying = false;
  let currentFrequency = 50; // Frecuencia por defecto inicial
  let detuneValue = 0;

  // Crear 8 osciladores
  function createOscillators(count) {
    // Detener y desconectar osciladores existentes si están activos
    if (isPlaying) {
      oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          console.error("Error stopping oscillator:", e);
        }
      });
    }

    oscillators = [];

    for (let i = 0; i < count; i++) {
      let oscillator = audioContext.createOscillator();
      let oscGain = audioContext.createGain();

      oscillator.type = "sawtooth";
      oscillator.frequency.value = currentFrequency; // Establecer frecuencia inicial
      oscillator.detune.value = i * 10 - (count / 2) * 10 + detuneValue;
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);

      oscillators.push(oscillator);
    }
  }

  // Iniciar osciladores
  function startOscillators() {
    if (!isPlaying) {
      createOscillators(8);
      oscillators.forEach((osc) => osc.start());
      isPlaying = true;
    }
  }

  // Reproducir una nota
  function playNote(frequency) {
    currentFrequency = frequency;
    if (!isPlaying) {
      startOscillators();
    }
    oscillators.forEach((osc) => {
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    });
  }

  // Detener osciladores
  function stopOscillators() {
    oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        console.error("Error stopping oscillator:", e);
      }
    });
    oscillators = [];
    isPlaying = false;
  }

  // Conectar el nodo de ganancia al destino
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.5;

  // Botón de encendido
  const powerButton = document.getElementById("power-button");
  if (powerButton) {
    powerButton.addEventListener("click", () => {
      if (isPlaying) {
        stopOscillators();
        powerButton.textContent = "Encender";
      } else {
        startOscillators();
        powerButton.textContent = "Apagar";
      }
    });
  } else {
    console.error("Power button not found");
  }

  // Teclas del piano
  document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("mousedown", () => {
      const note = parseFloat(key.dataset.note);
      playNote(note);
    });
  });

  // Control de volumen
  const volumeKnob = document.getElementById("master-volume-knob");
  if (volumeKnob) {
    volumeKnob.addEventListener("input", function () {
      const volume = parseFloat(this.value);
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    });
  } else {
    console.error("Volume knob not found");
  }

  // Control de detune
  const detuneKnob = document.getElementById("detune-knob");
  if (detuneKnob) {
    detuneKnob.addEventListener("input", function () {
      detuneValue = parseFloat(this.value);
      oscillators.forEach((osc, index) => {
        if (osc) {
          osc.detune.setValueAtTime(
            index * 10 - (oscillators.length / 2) * 10 + detuneValue,
            audioContext.currentTime
          );
        }
      });
    });
  } else {
    console.error("Detune knob not found");
  }

  // Control de frecuencia
  const frequencyKnob = document.getElementById("frequency-knob");
  if (frequencyKnob) {
    frequencyKnob.addEventListener("input", function () {
      const frequencyValue = parseFloat(this.value);
      playNote(frequencyValue);
    });
  } else {
    console.error("Frequency knob not found");
  }

  // Generar controles de volumen para cada oscilador
  const oscillatorVolumesContainer =
    document.getElementById("oscillator-volumes");
  if (oscillatorVolumesContainer) {
    oscillatorVolumesContainer.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const volumeControl = document.createElement("div");
      volumeControl.className = "knob-container";
      volumeControl.innerHTML = `
                <label for="osc-volume-${i}">Oscillator ${i + 1} Volume</label>
                <input type="range" id="osc-volume-${i}" min="0" max="1" step="0.01" value="0.5">
            `;
      oscillatorVolumesContainer.appendChild(volumeControl);

      document
        .getElementById(`osc-volume-${i}`)
        .addEventListener("input", function () {
          const volumeValue = parseFloat(this.value);
          if (oscillators[i]) {
            oscillators[i].gain.setValueAtTime(
              volumeValue,
              audioContext.currentTime
            );
          }
        });
    }
  } else {
    console.error("Oscillator volumes container not found");
  }

  // Inicializar los osciladores con frecuencia por defecto
  createOscillators(8);
});
