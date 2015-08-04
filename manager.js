/*! by Tom Thorogood <me@tomthorogood.co.uk> */
/*! This work is licensed under the Creative Commons Attribution 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by/4.0/ or see LICENSE. */

/*global MPW, document, window, console */

//Variables for UI element
var mpw, givenName, familyName, masterPassword, domainName, securityQuestion, securityQuestionDiv, userName, userNameDiv, type, resultType, generatePassword, password, passwordCard, copyPassword, passwordSel;

//Variable for calculations
var mpw, templateType, passwordType, fullName, error, id = 0;

//Constants - not using counter and using a set version of the algorithm
var COUNTER = 1, VERSION = 3;

function clearPassword() {
    hideElement(passwordCard);
    password.textContent = "";
}

function updateMPW() {
	error.textContent = password.textContent = "";
	
    generatePassword.disabled = true;
    
    fullName = givenName.value + familyName.value;
    
	if (fullName ===''||
		!masterPassword.value ) {
		mpw = null;
        return; 
	}
	
	mpw = new MPW(fullName, masterPassword.value, VERSION);
	
	mpw.key.then(function() {
        generatePassword.disabled = false;
    } );
}

function showElement(element) {
    element.classList.remove("hidden");
}

function hideElement(element) {
    element.classList.add("hidden");
}

function updatePassword() {
	error.textContent = password.textContent = "";
	
    var calculatedDomainName, posWWW;
    
    calculatedDomainName = domainName.value;
    
    //Trim a leading www value if present
    posWWW = calculatedDomainName.indexOf("www.");
    if (posWWW===0) {
        calculatedDomainName = calculatedDomainName.substr(4);
    } 
    
    if (userName.value!=='') {
        calculatedDomainName = userName.value + calculatedDomainName;
    }
    
	if (!mpw || calculatedDomainName==='' || templateType==='' || passwordType==='') {
		return;
	}
	
	var cid = ++id;
    var value;
	
    showElement(passwordCard);
    
	if (type.value === "answer") {
		value = mpw.generateAnswer(calculatedDomainName, COUNTER, securityQuestion, templateType);
	} else {
		value = mpw["generate" + passwordType](calculatedDomainName, COUNTER, templateType);
	}
	
	value.then(function (pass) {
		if (cid === id) {
            password.textContent = pass;
            passwordSel.value = pass;
		}
	}, function (err) {
		if (cid === id) {
			error.textContent = err.message;
		}
		
		console.error(err);
	});
}

function chooseType() {
    setType(this.id);
}

function setType(passwordSelection) {
    copyPassword.textContent = "Copy Password";
	showElement(userNameDiv);
    hideElement(securityQuestionDiv);
    

	switch (passwordSelection) {
		case "login":
			passwordType = "Login";
            templateType = "name";            
            generatePassword.textContent = "Generate User name";
            copyPassword.textContent = "Copy User name";
            hideElement(userNameDiv);
			break;
		case "maximum-password":
            generatePassword.textContent = "Generate Maximum Password";
            passwordType = "Password";
			templateType = "maximum";
			break;
		case "long-password":
            generatePassword.textContent = "Generate Long Password";
            passwordType = "Password";
			templateType = "long";
			break;
		case "medium-password":
            generatePassword.textContent = "Generate Medium Password";
            passwordType = "Password";
			templateType = "medium";
			break;
		case "basic-password":
            generatePassword.textContent = "Generate Basic Password";
            passwordType = "Password";
			templateType = "basic";
			break;
		case "short-password":
            generatePassword.textContent = "Generate Short Password";
            passwordType = "Password";
			templateType = "short";
			break;
		case "pin":
            generatePassword.textContent = "Generate PIN";
			copyPassword.textContent = "Copy PIN";
            passwordType = "Password";
			templateType = "pin";
			break;
		case "answer":
            generatePassword.textContent = "Generate Security Answer";
			copyPassword.textContent = "Copy Security Answer";
            passwordType = "Answer";
			templateType = "phrase";
            showElement(securityQuestionDiv);
			break;
	}
	
	updatePassword();
}

function copyPasswordToClpiboard() {
    passwordSel.focus();
    passwordSel.select();
    document.execCommand("Copy", false, null);
    copyPassword.focus();
}

window.addEventListener("load", function () {
	givenName = document.querySelector("[id=given-name]");
    familyName = document.querySelector("[id=family-name]");
	masterPassword = document.querySelector("[id=master-password]");
    generatePassword = document.querySelector("[id=generate-password]");
	domainName = document.querySelector("[id=domain]");
    securityQuestion = document.querySelector("[id=security-question]");
    securityQuestionDiv = document.querySelector("[id=security-question-div]");
    userName = document.querySelector("[id=user-name]");
    userNameDiv = document.querySelector("[id=user-name-div]");
	type = document.querySelector("[id=type]");
	passwordCard = document.querySelector("[id=password-card]");
    password  = document.querySelector(".password");
	error = document.querySelector(".error");
	passwordSel = document.querySelector("[id=password-select]");
	copyPassword = document.querySelector("[id=copy-password]");
	
	givenName.disabled = familyName.disabled = masterPassword.disabled = domainName.disabled = userName.disabled = type.disabled = false;
	
	updateMPW();
	givenName.addEventListener("change", updateMPW, false);
    givenName.addEventListener("input", clearPassword, false);
	familyName.addEventListener("change", updateMPW, false);
    familyName.addEventListener("input", clearPassword, false);
	masterPassword.addEventListener("change", updateMPW, false);
    masterPassword.addEventListener("input", clearPassword, false);
    securityQuestion.addEventListener("input", clearPassword, false);
	domainName.addEventListener("input", clearPassword, false);
    userName.addEventListener("input", clearPassword, false);
	
    //Loop through different values and add a listener
    for(var lCounter =0; lCounter < type.children.length; lCounter++) {
        type.children[lCounter].addEventListener("click",chooseType,false);
    }
        
    //Set initial type
	setType("long-password");
	generatePassword.addEventListener("click", updatePassword, false);
    copyPassword.addEventListener("click", copyPasswordToClpiboard, false);

    
	MPW.test().catch(function (err) {
		console.error(err);
		error.textContent = err.toString();
	});
}, false);