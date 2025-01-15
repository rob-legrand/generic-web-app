/*jslint browser */

// Here's a generic web app that uses model/view/controller code organization and web storage.

// All the code below will be run once the page content finishes loading.
document.addEventListener('DOMContentLoaded', function () {
   'use strict';

   // Create a factory that makes an object to keep track of a to-do list.
   const createToDoList = function (oldState) {
      let state; // Used to keep track of an object with a to-do list.

      // Create a default starting state with an empty to-do list.
      state = {
         list: []
      };
      // If there's a valid previous state, use it instead.
      if (typeof oldState === 'string') {
         try {
            state = JSON.parse(oldState);
         } catch (ignore) {
         }
      }

      // The self object contains public methods.
      const self = {
         addItem: function (item) {
            // Add a new item to the end of the list.
            state.list = [...state.list, item];
         },
         getItem: function (whichItem) {
            // Return the desired item from the list.
            return state.list[whichItem];
         },
         getNumItems: function () {
            // Return the number of items in the list.
            return state.list.length;
         },
         getState: function () {
            // Return a string representation of the state object, to be used for web storage.
            return JSON.stringify(state);
         },
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

      // Create a function that updates everything that needs updating whenever the model changes.
      const updateToDoList = function () {

         // Save the new state in web storage.
         localStorage.setItem('generic web app', toDoList.getState());

         // Update the view.
         const toDoListOutputElement = document.querySelector('#to-do-list-output');
         // Empty the #to-do-list-output element of all child elements.
         [...toDoListOutputElement.childNodes].forEach(function (childNode) {
            childNode.remove();
         });
         // Insert the list items as new li elements one by one.
         Array.from(
            {length: toDoList.getNumItems()},
            // Create each new li element in HTML.
            function () {
               return document.createElement('li');
            }
         ).forEach(function (liElement, whichItem) {
            // Give it its to-do list item.
            liElement.textContent = toDoList.getItem(whichItem);
            // Insert it just inside the end of the list.
            toDoListOutputElement.append(liElement);
         });

         // Update the controller:  Add a click handler to each new li element.
         [...toDoListOutputElement.querySelectorAll('li')].forEach(function (liElement, whichItem) {
            liElement.addEventListener('click', function () {
               // Update the model.
               toDoList.removeItem(whichItem);
               // Update everything else based on the new model state.
               updateToDoList();
            });
         });
      };

      // Set up the controller:  Handle adding a new to-do list item.
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
      toDoList = createToDoList(localStorage.getItem('generic web app'));
      // Update everything else based on the new model state.
      updateToDoList();
   }());
});
