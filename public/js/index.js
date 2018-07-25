// Firestore controller
const FirestoreCtrl = (function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBWk7lVtoTre1egeyUAeYr46ekMzqMhUxM",
    authDomain: "overload-tracker.firebaseapp.com",
    databaseURL: "https://overload-tracker.firebaseio.com",
    projectId: "overload-tracker",
    storageBucket: "overload-tracker.appspot.com",
    messagingSenderId: "972817594775"
  };
  firebase.initializeApp(config);

  const db = firebase.firestore();

  return {
    storeExercises: function() {
      const dataToSave = {
        date: new Date(),
        exercises: ExerciseCtrl.getExercises()
      };
      db.collection("exercises")
        .add(dataToSave)
        .then(() => {
          console.log("good");
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
})();

// Storage controller
const StorageCtrl = (function() {
  return {
    storeActiveExercise: function(activeExercise) {
      localStorage.setItem("activeExercise", JSON.stringify(activeExercise));
    },
    getActiveExercise: function() {
      if (localStorage.getItem("activeExercise") !== null) {
        return JSON.parse(localStorage.getItem("activeExercise"));
      }

      return {
        sets: [],
        name: "",
        category: ""
      };
    },
    removeSet: function(setId) {
      const activeExercise = JSON.parse(localStorage.getItem("activeExercise"));

      activeExercise.sets.forEach((set, index) => {
        if (set.id === setId) {
          activeExercise.sets.splice(index, 1);
        }
      });

      localStorage.setItem("activeExercise", JSON.stringify(activeExercise));
    },
    clearActiveExercise: function() {
      localStorage.removeItem("activeExercise");
    },
    clearExercises: function() {
      localStorage.removeItem('exercises');
    },
    storeExercise: function(exercise) {
      let exercises = [];
      if (localStorage.getItem("exercises") !== null) {
        exercises = JSON.parse(localStorage.getItem("exercises"));
        exercises.push(exercise);
        localStorage.setItem("exercises", JSON.stringify(exercises));
      } else {
        exercises.push(exercise);
        console.log(exercises);
        localStorage.setItem("exercises", JSON.stringify(exercises));
      }
    },
    getExercises: function() {
      let exercises = [];

      if (localStorage.getItem("exercises") !== null) {
        return JSON.parse(localStorage.getItem("exercises"));
      }

      return exercises;
    },
    storeWorkout: function() {
      let workouts = [];
      const d = new Date();
      const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      const dataToSave = {
        date: date,
        workout: ExerciseCtrl.getExercises()
      };

      if (localStorage.getItem("workouts") !== null) {
        workouts = JSON.parse(localStorage.getItem("workouts"));
        workouts.forEach((workout, index) => {
          if ((workout.date = dataToSave.date)) {
            workouts.splice(index, 1);
          }
        });
      }

      workouts.push(dataToSave);
      localStorage.setItem("workouts", JSON.stringify(workouts));

      StorageCtrl.clearActiveExercise();
      StorageCtrl.clearExercises();

      UICtrl.flashMessage("Workout has been saved!");
      setTimeout(()=> {
        location.reload();
      }, 1500)
    }
  };
})();

// Set controller
const SetCtrl = (function() {
  // Set constructor
  const Set = function(id, weight, reps) {
    this.id = id;
    this.weight = weight;
    this.reps = reps;
  };

  return {
    createSet: function(weight, reps) {
      let id = 0;
      const activeExerciseSets = ExerciseCtrl.getActiveExercise().sets;
      if (activeExerciseSets.length > 0) {
        id = activeExerciseSets[activeExerciseSets.length - 1].id + 1;
      }
      return new Set(id, parseInt(weight), parseInt(reps));
    },
    toString: function(set) {
      return `${set.reps} X ${set.weight}Kg`;
    }
  };
})();

// Exercise controller
const ExerciseCtrl = (function() {
  // Exercise constructor
  const Exercise = function(id, category, name, sets) {
    this.id = id;
    this.category = category;
    this.name = name;
    this.sets = sets;
  };

  // Data structure
  const data = {
    activeExercise: StorageCtrl.getActiveExercise(),
    exercises: StorageCtrl.getExercises()
  };

  return {
    getActiveExercise: function() {
      return data.activeExercise;
    },
    setActiveExercise: function() {
      data.activeExercise = StorageCtrl.getActiveExercise();
    },
    getExercises: function() {
      return data.exercises;
    },
    addSet: function(set) {
      data.activeExercise.category = UICtrl.getInput().category;
      data.activeExercise.name = UICtrl.getInput().name;
      data.activeExercise.sets.push(set);

      StorageCtrl.storeActiveExercise(ExerciseCtrl.getActiveExercise());
      ExerciseCtrl.setActiveExercise();
    },
    deleteSet: function(setId) {
      data.activeExercise.sets.forEach((set, index) => {
        if (set.id === setId) {
          data.activeExercise.sets.splice(index, 1);
        }
      });

      StorageCtrl.removeSet(setId);

      if (data.activeExercise.sets.length === 0) {
        UICtrl.hideActiveExercise();
      }
    },
    saveActiveExercise: function() {
      const input = UICtrl.getInput();
      const newExercise = new Exercise(
        `${data.activeExercise.category}-${data.activeExercise.name}`,
        data.activeExercise.category,
        data.activeExercise.name,
        data.activeExercise.sets
      );
      data.exercises.push(newExercise);
      return newExercise;
    },
    clearActiveExercise: function() {
      data.activeExercise = {
        sets: [],
        name: "",
        category: ""
      };
    },
    logData: function() {
      return data;
    }
  };
})();

// UI controller
const UICtrl = (function() {
  UISelectors = {
    categoryInput: "#category-input",
    nameInput: "#name-input",
    weightInput: "#weight-input",
    repsInput: "#reps-input",
    activeExercise: "#active-exercise",
    addSetBtn: "#add-set-btn",
    saveExerciseBtn: "#save-exercise-btn",
    deleteSetBtn: "#delete-set",
    listItem: ".collection-item",
    activeExerciseSection: ".active-exercise-section",
    saveWorkoutBtn: "#save-workout-btn"
  };

  return {
    createListItem: function(className, id, text, withDeleteBtn) {
      const li = document.createElement("li");
      li.className = className;
      li.id = id;
      li.innerHTML = text;

      if (withDeleteBtn) {
        const deleteBtn = document.createElement("a");
        deleteBtn.className = "secondary-content";
        deleteBtn.innerHTML =
          '<i class="material-icons delete-icon">delete</i>';
        deleteBtn.setAttribute("href", "#");
        li.appendChild(deleteBtn);
      }

      return li;
    },
    populateSets: function(sets) {
      console.log(sets);
      if (sets.length > 0) {
        UICtrl.showActiveExercise(true);
      }

      sets.forEach(set => {
        const li = this.createListItem(
          "collection-item",
          set.id,
          `${set.reps} X ${set.weight}Kg`,
          true
        );
        document.querySelector(UISelectors.activeExercise).appendChild(li);
      });
    },
    populateExercises: function(exercises) {
      exercises.forEach(exercise => {
        this.addExerciseToList(exercise);
      });
    },
    getSelectors: function() {
      return UISelectors;
    },
    getInput: function() {
      const categoryInput = document.querySelector(UISelectors.categoryInput);
      const nameInput = document.querySelector(UISelectors.nameInput);
      return {
        category: categoryInput.options[categoryInput.selectedIndex].text,
        name: nameInput.options[nameInput.selectedIndex].text,
        weight: document.querySelector(UISelectors.weightInput).value,
        reps: document.querySelector(UISelectors.repsInput).value
      };
    },
    clearInput: function() {
      document.querySelector(UISelectors.weightInput).value = "";
      document.querySelector(UISelectors.repsInput).value = "";
    },
    showActiveExercise: function(withHeader = false) {
      if (
        ExerciseCtrl.getActiveExercise().sets.length === 1 ||
        withHeader === true
      ) {
        const headerLi = UICtrl.createListItem(
          "collection-header",
          ExerciseCtrl.getActiveExercise().name,
          `<h5>${ExerciseCtrl.getActiveExercise().name}`
        );
        const activeExerciseList = document.querySelector(
          UISelectors.activeExercise
        );
        activeExerciseList.innerHTML = "";
        activeExerciseList.appendChild(headerLi);
      }
      console.log("ran");
      document
        .querySelector(UISelectors.activeExerciseSection)
        .classList.remove("hide");
    },
    hideActiveExercise: function() {
      console.log("run");
      document
        .querySelector(UISelectors.activeExerciseSection)
        .classList.add("hide");
    },
    addSetToList: function(set) {
      this.showActiveExercise();
      const li = this.createListItem(
        "collection-item animated slideInRight",
        set.id,
        SetCtrl.toString(set),
        true
      );
      document
        .querySelector(UISelectors.activeExercise)
        .insertAdjacentElement("beforeend", li);
    },
    deleteSetFromList: function(setId) {
      const activeExerciseList = document.querySelector(
        UISelectors.activeExercise
      );
      for (let i = 0; i < activeExerciseList.childNodes.length; i++) {
        if (activeExerciseList.childNodes[i].id == setId) {
          activeExerciseList.childNodes[i].classList.add("slideOutLeft");
          activeExerciseList.removeChild(activeExerciseList.childNodes[i]);
        }
      }
    },
    addExerciseToList: function(exercise, withMsg = false) {
      const ul = document.createElement("ul");
      ul.className = "collection with-header";
      ul.id = exercise.id;
      const headerLi = this.createListItem(
        "collection-header",
        exercise.name,
        `<h5>${exercise.name}</h5>
                               <div class="secondary-content">
                                <a href="#"><i class="material-icons">delete</i></a>
                              </div>`,
        false
      );
      ul.appendChild(headerLi);
      exercise.sets.forEach(set => {
        const li = this.createListItem(
          "collection-item",
          set.id,
          `${set.reps} X ${set.weight}Kg`,
          false
        );
        ul.appendChild(li);
      });
      document.getElementById(exercise.category).appendChild(ul);

      UICtrl.hideActiveExercise();
      UICtrl.badgeConfig(exercise.category);
      UICtrl.clearInput();
      ExerciseCtrl.clearActiveExercise();

      withMsg ? UICtrl.flashMessage("Exercise Added!") : null;
    },
    badgeConfig: function(category) {
      let count = 0;

      // Get badge from dom
      const badge = document.getElementById(`${category}-collapse`)
        .childNodes[1];

      ExerciseCtrl.getExercises().forEach(exercise => {
        if (exercise.category === category) count++;
      });
      if (count > 0) {
        // Remove '.hide' from badge
        badge.classList.remove("hide");
        // Set the number of exercises to the badge
        badge.innerText = count;
      } else {
        // Hide badge
        badge.classList.add("hide");
      }
    },
    flashMessage: function(msg) {
      Materialize.toast(msg, 4000);
    }
  };
})();

// App controller
const App = (function(ExerciseCtrl, StorageCtrl, UICtrl, FirestoreCtrl) {
  const UISelectors = UICtrl.getSelectors();

  const loadEventListeners = function() {
    // Add set event
    document
      .querySelector(UISelectors.addSetBtn)
      .addEventListener("click", addSetSubmit);

    // Delete set event
    document
      .querySelector(UISelectors.activeExercise)
      .addEventListener("click", deleteSetSubmit);

    // Save exercise event
    document
      .querySelector(UISelectors.saveExerciseBtn)
      .addEventListener("click", saveExerciseSubmit);

    // Save workout event
    document
      .querySelector(UISelectors.saveWorkoutBtn)
      .addEventListener("click", saveWorkoutSubmit);
  };

  // Add-set submit
  const addSetSubmit = function(e) {
    const input = UICtrl.getInput();
    if (input.weight !== "" && input.reps !== "") {
      const newSet = SetCtrl.createSet(input.weight, input.reps);
      ExerciseCtrl.addSet(newSet);
      UICtrl.addSetToList(newSet);
    }
  };

  // Delete set submit
  const deleteSetSubmit = function(e) {
    if (e.target.classList.contains("delete-icon")) {
      const setId = parseInt(e.target.parentNode.parentNode.id);
      ExerciseCtrl.deleteSet(setId);
      UICtrl.deleteSetFromList(setId);
    }
  };

  // Save exercise submit
  const saveExerciseSubmit = function() {
    const newExercise = ExerciseCtrl.saveActiveExercise();
    UICtrl.addExerciseToList(newExercise, true);
    StorageCtrl.clearActiveExercise();
    StorageCtrl.storeExercise(newExercise);
  };

  // Save workout submit
  const saveWorkoutSubmit = function() {
    StorageCtrl.storeWorkout();
  };
  return {
    init: function() {
      // Materialize init
      $(".button-collapse").sideNav();
      $("select").material_select();
      $(".modal").modal();

      UICtrl.populateExercises(ExerciseCtrl.getExercises());
      ExerciseCtrl.setActiveExercise();
      UICtrl.populateSets(ExerciseCtrl.getActiveExercise().sets);

      loadEventListeners();
    }
  };
})(ExerciseCtrl, StorageCtrl, UICtrl, FirestoreCtrl);

// Initialize App
App.init();
