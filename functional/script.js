/*jslint browser */

// Here's a generic web app that uses model/view/controller code organization and web storage,
// using a more functional programming style.

// All the code below will be run once the page content finishes loading.
document.addEventListener('DOMContentLoaded', function () {
   'use strict';

   // Create an object full of to-do-list helper methods.
   const tdl = (function () {

      // The util object contains all private methods, which can be used by both util and self methods.
      const util = Object.freeze({
         createUnfrozenList: (oldList) => (
            // Create a new unfrozen object to keep track of a to-do list.
            Array.isArray(oldList)
            ? [...oldList]
            : []
         ),
         deepCopy: (oldThing, func) => (
            // Create a new object, deeply copied, with func applied at each level.
            typeof func === 'function'
            ? func
            : (x) => x
         )(
            Array.isArray(oldThing)
            // If it's an array, use map directly.
            ? oldThing.map(
               (x) => util.deepCopy(x, func)
            )
            : typeof oldThing === 'object'
            // If it's a non-array object, we must be less direct.
            ? Object.fromEntries(
               Object.entries(oldThing).map(
                  (x) => [x[0], util.deepCopy(x[1], func)]
               )
            )
            // Otherwise, no recursion is required.
            : oldThing
         )
      });

      // The self object contains all public methods; it gets returned below.
      const self = Object.freeze({
         addItem: (list, item) => util.deepCopy(
            // Add a new item to the end of the list.
            [...list, item],
            Object.freeze
         ),
         createElement: function (args) {
            // Create a new HTML element.
            const newElement = document.createElement(args?.elementType ?? 'div');
            // Give it desired attributes.
            if (typeof args?.attributes === 'object') {
               Object.entries(args.attributes).forEach(function (attribute) {
                  newElement.setAttribute(attribute[0], attribute[1]);
               });
            }
            // Give it desired CSS classes.
            if (Array.isArray(args?.classList)) {
               args.classList.forEach(function (aClass) {
                  newElement.classList.add(aClass);
               });
            }
            // Give it desired children: HTML elements or text.
            newElement.replaceChildren(...(
               Array.isArray(args?.children)
               ? args.children
               : (
                  typeof args?.textContent === 'string'
                  || Number.isFinite(args?.textContent)
               )
               ? [document.createTextNode(args.textContent)]
               : []
            ));
            // Give it a desired title.
            if (typeof args?.title === 'string') {
               newElement.title = args.title;
            }
            return newElement;
         },
         createList: (oldList) => util.deepCopy(
            // Create a new frozen object to keep track of a to-do list.
            util.createUnfrozenList(
               (function () {
                  // If it's a valid JSON string, parse it.
                  try {
                     return JSON.parse(oldList);
                  } catch (ignore) {
                  }
                  // Otherwise, just use it.
               }()) ?? oldList
            ),
            Object.freeze
         ),
         removeItem: (list, whichItem) => util.deepCopy(
            // Remove an item from anywhere in the list.
            [
               ...list.slice(0, whichItem),
               ...list.slice(whichItem + 1)
            ],
            Object.freeze
         )
      });

      return self;
   }());

   // Create a new closure to hide the view and controller from the model code above.
   (function () {
      let toDoList; // Used to keep track of the model.

      const localStorageKey = 'generic-web-app-functional';

      // Create a function that updates everything that needs updating whenever the model changes.
      const updateToDoList = function () {

         // Save the new state in web storage.
         localStorage.setItem(localStorageKey, JSON.stringify(toDoList));

         // Update the view.
         const toDoListOutputElement = document.querySelector('#to-do-list-output');
         // Create the list items as an array of new li elements one by one.
         const newListItems = toDoList.map(
            function (item) {
               // Create a new li element in HTML.
               const liElement = document.createElement('li');
               // Give it its to-do-list item.
               liElement.textContent = item;
               // Place it in the new array.
               return liElement;
            }
         );
         // In the page, replace the old items in the list with the new ones.
         toDoListOutputElement.replaceChildren(...newListItems);

         // Update the controller:  Add a click handler to each new li element.
         newListItems.forEach(function (liElement, whichItem) {
            liElement.addEventListener('click', function () {
               // Update the model.
               toDoList = tdl.removeItem(toDoList, whichItem);
               // Update everything else based on the new model state.
               updateToDoList();
            });
         });
      };

      // Set up the controller:  Handle adding a new to-do-list item.
      document.querySelector('#add-to-do-list-item').addEventListener('click', function () {
         // Update the model.
         const itemToAdd = document.querySelector('#to-do-list-item-to-add').value;
         if (itemToAdd.length > 0) {
            toDoList = tdl.addItem(toDoList, itemToAdd);
         }
         // Update everything else based on the new model state.
         updateToDoList();
      });

      // When the page is loaded, get any saved state from web storage and use it to create a new model.
      toDoList = tdl.createList(localStorage.getItem(localStorageKey));
      // Update everything else based on the new model state.
      updateToDoList();
   }());
});
