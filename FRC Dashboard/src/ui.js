// ---------- DEFINE UI ELEMENTS ---------- //





let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state').firstChild,
    gyro: {
        container: document.getElementById('gyro'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('gyro-arm'),
        number: document.getElementById('gyro-number')
    },
    robotDiagram: {
        arm: document.getElementById('robot-arm'),
        pickup_long: document.getElementById('pickup-long'),
        pickup_short: document.getElementById('pickup-short'),
    },
    autoSelect: document.getElementById('auto-select')
};





// ---------- KEY EVENT LISTENERS ---------- //





// The following case is an example, for a robot with an arm at the front.
NetworkTables.addKeyListener('/SmartDashboard/arm/encoder', (key, value) => {
    // 0 is all the way back, 1200 is 45 degrees forward. We don't want it going past that.
    if (value > 1200) {
        value = 1200;
    }
    else if (value < 0) {
        value = 0;
    }
    // Calculate visual rotation of arm
    var height = 160 + (value / 6);
    // Rotate the arm in diagram to match real arm

    function updateGuide(value, test, level) {
        var line = document.getElementById(level + "-guide-line");
        var text = document.getElementById(level + "-guide-text");
        if (test - 60 < value && value < test + 60) {
            if (!line.classList.contains('guide-line-on')) {
                line.classList.add("guide-line-on");
                line.classList.remove("guide-line-off");
                text.classList.add("guide-text-on");
                text.classList.remove("guide-text-off");
            }
        }
        else {
            if (line.classList.contains('guide-line-on')) {
                line.classList.add("guide-line-off");
                line.classList.remove("guide-line-on");
                text.classList.add("guide-text-off");
                text.classList.remove("guide-text-on");
            }
        }
    }

    updateGuide(value, 0, "high");
    updateGuide(value, 400, "middle");
    updateGuide(value, 800, "low");
    updateGuide(value, 1200, "pickup");

    ui.robotDiagram.arm.style.y = String(height);
});

// The following case is an example, for a robot with an arm at the front.
NetworkTables.addKeyListener('/SmartDashboard/pickup/encoder', (key, value) => {
    if (value > 1200) {
        value = 1200;
    }
    else if (value < 0) {
        value = 0;
    }
    var length = 50 + (value / 14);

    if (-200 < value && value < 200) {
        document.getElementById("pickup-status").classList.add("guide-text-on");
        document.getElementById("pickup-status").classList.remove("guide-text-off");
        document.getElementById("pickup-status").classList.remove("guide-text-mid");
        document.getElementById("pickup-status").innerHTML = "Out";
    }
    else if (1000 < value && value < 1400) {
        document.getElementById("pickup-status").classList.add("guide-text-off");
        document.getElementById("pickup-status").classList.remove("guide-text-on");
        document.getElementById("pickup-status").classList.remove("guide-text-mid");
        document.getElementById("pickup-status").innerHTML = "In";
    }
    else {
        document.getElementById("pickup-status").classList.add("guide-text-mid");
        document.getElementById("pickup-status").classList.remove("guide-text-on");
        document.getElementById("pickup-status").classList.remove("guide-text-off");
        document.getElementById("pickup-status").innerHTML = "-----";
    }

    ui.robotDiagram.pickup_long.style.x = String(length);
    ui.robotDiagram.pickup_short.style.x = String(length);
});

NetworkTables.addKeyListener('/robot/time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.innerHTML = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/modes', (key, value) => {
    // Clear previous list
    while (ui.autoSelect.firstChild) {
        ui.autoSelect.removeChild(ui.autoSelect.firstChild);
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let i = 0; i < value.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        ui.autoSelect.appendChild(option);
    }
    // Set value to the already-selected mode. If there is none, nothing will happen.
    ui.autoSelect.value = NetworkTables.getValue('/SmartDashboard/currentlySelectedMode');
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/selected', (key, value) => {
    ui.autoSelect.value = value;
});





// ---------- UI ELEMENT CLICKS ---------- //





// Update NetworkTables when autonomous selector is changed
ui.autoSelect.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/autonomous/selected', this.value);
};





// ---------- OTHER ERROR CODES ---------- //





addEventListener('error',(ev)=>{
    ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
});