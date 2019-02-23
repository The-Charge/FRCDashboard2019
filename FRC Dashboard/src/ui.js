// Define UI elements
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
    example: {
        button: document.getElementById('example-button'),
        readout: document.getElementById('example-readout').firstChild
    },
    autoSelect: document.getElementById('auto-select'),
    armPosition: document.getElementById('arm-position'),
    pickupPosition: document.getElementById('pickup-position')
};




// ---------- KEY EVENT LISTENERS ---------- //





function updateLight(key, value) {
    // Get ID of the changed light
    var lightName = key.substring(16, key.length);
    var light = document.getElementById(lightName);
    if (value == true) { // If true, fill the circle
        //document.getElementById(lightName).style.fill = "#59f442";
        // The commented line below would set it the fill to the current theme, but it's not working
        //document.getElementById(propName).style.fill = document.getElementById(propName).style.stroke;

        var element = document.getElementById('light_0');
        // var style = window.getComputedStyle(element);
        // var color = style.getPropertyValue('stroke');
        // document.getElementById('test-data').innerHTML = color;
        // document.getElementById(lightName).classList.add("filledShape");

        if (!light.classList.contains('light-on')) {
            light.classList.add("light-on");
            //light.style.fill = window.getComputedStyle(light).getPropertyValue('stroke');
        }
    }
    else if (value == false) { // I false, empty the circle
        //document.getElementById(lightName).style.fill = "none";
        if (light.classList.contains('light-on')) {
            light.classList.remove("light-on");
            //light.style.fill = 'none';
        }
    }
}
NetworkTables.addKeyListener('/SmartDashboard/light_0', updateLight);
NetworkTables.addKeyListener('/SmartDashboard/light_1', updateLight);
NetworkTables.addKeyListener('/SmartDashboard/light_2', updateLight);
NetworkTables.addKeyListener('/SmartDashboard/light_3', updateLight);
NetworkTables.addKeyListener('/SmartDashboard/light_4', updateLight);

// Gyro rotation
let updateGyro = (key, value) => {
    ui.gyro.val = value;
    ui.gyro.visualVal = Math.floor(ui.gyro.val - ui.gyro.offset);
    ui.gyro.visualVal %= 360;
    if (ui.gyro.visualVal < 0) {
        ui.gyro.visualVal += 360;
    }
    ui.gyro.arm.style.transform = `rotate(${ui.gyro.visualVal}deg)`;
    ui.gyro.number.innerHTML = ui.gyro.visualVal + 'º';
};
NetworkTables.addKeyListener('/SmartDashboard/drive/navx/yaw', updateGyro);

// The following case is an example, for a robot with an arm at the front.
NetworkTables.addKeyListener('/SmartDashboard/arm/encoder', (key, value) => {
    // 0 is all the way back, 1200 is 45 degrees forward. We don't want it going past that.
    if (value > 28000) {
        value = 28000;
    }
    else if (value < 0) {
        value = 0;
    }
    // Calculate visual rotation of arm
    var height = 160 + (value / (140));    //Should scale the arm correctly
    // Rotate the arm in diagram to match real arm

    function updateGuide(value, test, level) {
        var line = document.getElementById(level + "-guide-line");
        var text = document.getElementById(level + "-guide-text");
        if (test - 1000 < value && value < test + 1000) {
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
    updateGuide(value, 9333.333, "middle");
    updateGuide(value, 18666.666, "low");
    updateGuide(value, 28000, "pickup");

    ui.robotDiagram.arm.style.y = String(height);
});

// The following case is an example, for a robot with an arm at the front.
NetworkTables.addKeyListener('/SmartDashboard/pickup/encoder', (key, value) => {
    // 0 is all the way back, 1200 is 45 degrees forward. We don't want it going past that.
    if (value > 1200) {
        value = 1200;
    }
    else if (value < 0) {
        value = 0;
    }
    // Calculate visual rotation of arm
    var length = 50 + (value / 14);
    // Rotate the arm in diagram to match real arm

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

// This button is just an example of triggering an event on the robot by clicking a button.
NetworkTables.addKeyListener('/SmartDashboard/example_variable', (key, value) => {
    // Set class active if value is true and unset it if it is false
    ui.example.button.classList.toggle('active', value);
    ui.example.readout.data = 'Value is ' + value;
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





// The rest of the doc is listeners for UI elements being clicked on
ui.example.button.onclick = function() {
    // Set NetworkTables values to the opposite of whether button has active class.
    NetworkTables.putValue('/SmartDashboard/example_variable', this.className != 'active');
};
// Reset gyro value to 0 on click
ui.gyro.container.onclick = function() {
    // Store previous gyro val, will now be subtracted from val for callibration
    ui.gyro.offset = ui.gyro.val;
    // Trigger the gyro to recalculate value.
    updateGyro('/SmartDashboard/drive/navx/yaw', ui.gyro.val);
};
// Update NetworkTables when autonomous selector is changed
ui.autoSelect.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/autonomous/selected', this.value);
};
// Get value of arm height slider when it's adjusted
ui.armPosition.oninput = function() {
    NetworkTables.putValue('/SmartDashboard/arm/encoder', parseInt(this.value));
};
// Get value of pickup position slider when it's adjusted
ui.pickupPosition.oninput = function() {
    NetworkTables.putValue('/SmartDashboard/pickup/encoder', parseInt(this.value));
};

addEventListener('error',(ev)=>{
    ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
});