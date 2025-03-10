/*jslint browser */

// Here's a generic web app that uses model/view/controller code organization and web storage.

// All the code below will be run once the page content finishes loading.
document.addEventListener('DOMContentLoaded', function () {
   'use strict';

   // Create a factory that makes an object to keep track of a to-do list.
   const createToDoList = function (oldState) {

      // Keep track of an object with a to-do list.
      const state = (function () {
         // If there's a valid previous state, use it.
         try {
            return JSON.parse(oldState);
         } catch (ignore) {
         }
      }()) ?? {
         // Otherwise, create a default starting state with an empty to-do list.
         list: []
      };

      // The self object contains public methods.
      const self = {
         addItem: function (item) {
            // Add a new item to the end of the list.
            state.list = [...state.list, item];
         },
         getList: () => (
            // Return a copy of the list (not the original!).
            [...state.list]
         ),
         getState: () => (
            // Return a string representation of the state object, to be used for web storage.
            JSON.stringify(state)
         ),
         removeItem: function (whichItem) {
            // Remove an item from anywhere in the list.
            state.list = [
               ...state.list.slice(0, whichItem),
               ...state.list.slice(whichItem + 1)
            ];
         }
      };
      // Normally it's best to freeze the self object to keep it from being modified later.
      return Object.freeze(self);
   };

   // Create a new closure to hide the view and controller from the model code above.
   (function () {
      let toDoList; // Used to keep track of the model.

      const localStorageKey = 'generic-web-app-object-oriented';

      // Create a function that updates everything that needs updating whenever the model changes.
      const updateToDoList = function () {

         // Save the new state in web storage.
         localStorage.setItem(localStorageKey, toDoList.getState());

         // Update the view.
         const toDoListOutputElement = document.querySelector('#to-do-list-output');
         // Create the list items as an array of new li elements one by one.
         const newListItems = toDoList.getList().map(
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
               toDoList.removeItem(whichItem);
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
            toDoList.addItem(itemToAdd);
         }
         // Update everything else based on the new model state.
         updateToDoList();
      });

      // When the page is loaded, get any saved state from web storage and use it to create a new model.
      toDoList = createToDoList(localStorage.getItem(localStorageKey));
      // Update everything else based on the new model state.
      updateToDoList();
   }());
});
