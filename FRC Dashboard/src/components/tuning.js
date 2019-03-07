// ---------- CREATE UI AND GLOBAL VARIABLES ---------- //





ui.tuning = {
    list: document.getElementById('tuning'),
    button: document.getElementById('tuning-button'),
    name: document.getElementById('name'),
    value: document.getElementById('value'),
	set: document.getElementById('set'),
    get: document.getElementById('get'),
    add: document.getElementById('add')
};

// Create a dictionary to store wanted/unwanted tuning variables
var wanted = {};
var defaultValue = true;
var defaultFunctionValue = true;





// ---------- ADD MAIN LISTENER ---------- //





// Sets function to be called when any NetworkTables key/value changes
NetworkTables.addGlobalListener(isWanted, true);

// Function called instead of onValueChanged, used to filter out unneeded values
function isWanted(key, value, isNew) {
    // Remove behind-the-scenes not needed variables (as defined in filterStrings below)
    var filterStrings = [".name", ".isParented", ".controllable"];
    // Test the key against every value in filterStrings
    var i;
    for (i=0; i< filterStrings.length; i++) {
        // To avoid errors, only check the value if the key's length is longer or equal to the filterString's
        if (testStrings(key, filterStrings[i])) { return; }
    }

    // If there is not a key in the dictionary, create a default one
    var propName = key.substring(16, key.length);
    if (wanted[propName] == undefined) {
        if (testStrings(key, "/running")) {
            wanted[propName] = defaultFunctionValue;
        }
        else {
            wanted[propName] = defaultValue;
        }
    }

    // If the value is wanted, call onValueChanged
    if (wanted[propName]) {
        isNew = true;
        onValueChanged(key, value, isNew);
    }    
    // If none of the above tests called a return, update the function in tuning
}

// Tests the last character of toTest to see if they match filter
// If they do then return true, if not return false
function testStrings(toTest, filter) {
    if (toTest.length >= filter.length) {
        // Check the last characters of the key to see if they match the filter string
        if (toTest.substring(toTest.length - filter.length) == filter) {
            return true;
        }
    }
    return false;
}

// Special update function to change the properties of function buttons
function functionButtonSet(element, value) {
    if (value) {
        element.value = "Cancel";
        element.style.color = "red";
    }
    else {
        element.value = "Run";
        element.style.color = "#59f442";
    }
}

function onValueChanged(key, value, isNew) {
    // Sometimes, NetworkTables will pass booleans as strings. This corrects for that.
    if (value == 'true') {
        value = true;
    }
    else if (value == 'false') {
        value = false;
    }
    // The following code manages tuning section of the interface.
    // This section displays a list of all NetworkTables variables (that start with /SmartDashboard/) and allows you to directly manipulate them.
    var propName = key.substring(16, key.length);
    // Check if value is new and doesn't have a spot on the list yet
    if (isNew && !document.getElementsByName(propName)[0]) {
        // Make sure name starts with /SmartDashboard/. Properties that don't are technical and don't need to be shown on the list.
        if (/^\/SmartDashboard\//.test(key)) {
            // Make a new div for this value
            var div = document.createElement('div'); // Make div

            ui.tuning.list.appendChild(div); // Add the div to the page
            var p = document.createElement('p'); // Make a <p> to display the name of the property

            // Make content of <p> have the name of the NetworkTables value
            if (testStrings(key, "/running")) {
                p.appendChild(document.createTextNode(propName.substring(0, propName.length - 8))); // if the name of the property is a function, cut off '/running'
            }
            else {
                p.appendChild(document.createTextNode(propName));
            }

            div.appendChild(p); // Put <p> in div
            var input = document.createElement('input'); // Create input
            input.name = propName; // Make its name property be the name of the NetworkTables value
            input.value = value; // Set
            // The following statement figures out which data type the variable is.
            // If it's a boolean, it will make the input be a checkbox. If it's a number,
            // it will make it a number chooser with up and down arrows in the box. Otherwise, it will make it a textbox.
            // The first function will set the input to a button if the value's a function
            if (testStrings(key, "/running")) {
                input.type = "button"
                functionButtonSet(input, value);
                input.onclick = function () {
                    NetworkTables.putValue(key, !NetworkTables.getValue(key));
                    functionButtonSet(this, NetworkTables.getValue(key));
                };
            }
            else if (typeof value === 'boolean') {
                input.type = 'checkbox';
                input.checked = value; // value property doesn't work on checkboxes, we'll need to use the checked property instead
                input.onchange = function () {
                    // For booleans, send bool of whether or not checkbox is checked
                    NetworkTables.putValue(key, this.checked);
                };
            }
            else if (!isNaN(value)) {
                input.type = 'number';
                input.onchange = function () {
                    // For number values, send value of input as an int.
                    NetworkTables.putValue(key, parseInt(this.value));
                };
            }
            else {
                input.type = 'text';
                input.onchange = function () {
                    // For normal text values, just send the value.
                    NetworkTables.putValue(key, this.value);
                };
            }
            // Put the input into the div.
            div.appendChild(input);
        }
    }
    else {
        // Find already-existing input for changing this variable
        var oldInput = document.getElementsByName(propName)[0];
        if (oldInput) {
            if (testStrings(key, "/running")) {
                functionButtonSet(oldInput, value);
            }
            else if (oldInput.type === 'checkbox') {
                oldInput.checked = value;
            }
            else {
                oldInput.value = value;
            }
        }
        else {
            console.log('Error: Non-new variable ' + key + ' not present in tuning list!');
        }
    }
}





// ---------- INTERACT WITH UI ELEMENTS ---------- //





// Open tuning section when button is clicked
ui.tuning.button.onclick = function() {
	if (ui.tuning.list.style.display === 'none') {
		ui.tuning.list.style.display = 'block';
	} else {
		ui.tuning.list.style.display = 'none';
	}
};

// Adds listeners to bind enter to set button
var name_entry = document.getElementById("name");
var value_entry = document.getElementById("value");
// Create function to reasign enter key
function clickOnEnter(event) {
    if (event.keyCode === 13) { // Key 13 is the keycode for enter
        event.preventDefault(); // Prevent the default action of the enter key
        document.getElementById("set").click(); // Runs as if the 'set' button was clicked
    }
}
// Add listener to entry fields
name_entry.addEventListener("keyup", clickOnEnter);
value_entry.addEventListener("keyup", clickOnEnter);

// Manages get and set buttons at the top of the tuning pane
ui.tuning.set.onclick = function() {
    if (ui.tuning.name.value && ui.tuning.value.value) { // Make sure the inputs have content
        NetworkTables.putValue('/SmartDashboard/' + ui.tuning.name.value, ui.tuning.value.value);
    }
};
ui.tuning.get.onclick = function() {
	ui.tuning.value.value = NetworkTables.getValue(ui.tuning.name.value);
};
ui.tuning.add.onclick = function() {
    wanted[ui.tuning.name.value] = true;
    // Try this with robot connected: document.getElementById('test-data').innerHTML = NetworkTables.getValue("/SmartDashboard/theme", "NOOOOO");
    //NetworkTables.putValue("/SmartDashboard/" + ui.tuning.name.value, )
};