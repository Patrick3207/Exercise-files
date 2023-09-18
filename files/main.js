/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Resource {

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `resource-${this.id}`;
    }

}

function add(resource, sibling) {

    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

    creator
        .append(new ElementCreator("h2").text(resource.modell))

    creator
        .append(new ElementCreator("h3").text("Preis: " + resource.preis + "€"))
        
    creator
        .append(new ElementCreator("h5").text("Marke: " + resource.marke))
        


    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', () => {

          /*  fetch(`/api/resources/${resource.id}` ,{
                method: 'DELETE',
            }).then(res => {
                if (!res.ok){
                    remove(resource);
                }
            }).catch(error => {
                console.log(error)
            }) */

            const xhr = new XMLHttpRequest();
            xhr.open('DELETE', `/api/resources/${resource.id}`, true);

            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4) {
                    if(xhr.status === 204){
                        alert("Successful deleted")
                        remove(resource);
                    }
                    else {
                        console.error('Fail request with status:', xhr.status);
                    }
                }
            };
            xhr.send();

            /* Task 3: Call the delete endpoint asynchronously using either an XMLHttpRequest
               or the Fetch API. Once the call returns successfully, remove the resource from
               the DOM using the call to remove(...) below. */
           // remove(resource);  // <- This call removes the resource from the DOM. Call it after (and only if) your API call succeeds!
        }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
        
}

function edit(resource) {
    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.modell));

    
    /* Task 4 - Part 1: Instead of the name property, add the properties your resource has here!
       The label and input element used here are just an example of how you can edit a
       property of a resource, in the case of our example property name this is a label and an
       input field. Also, we assign the input field a unique id attribute to be able to identify
       it easily later when the user saves the edited data (see Task 4 - Part 2 below). 
    */

    formCreator
        .append(new ElementCreator("label").text("Neues Modell").with("for", "resource-preis"))
        .append(new ElementCreator("input").id("resource-modell").with("type", "text").with("value", resource.modell));

    formCreator
        .append(new ElementCreator("label").text("Neuer Preis").with("for", "resource-preis"))
        .append(new ElementCreator("input").id("resource-preis").with("type", "text").with("value", resource.preis));

    formCreator
        .append(new ElementCreator("label").text("Neue Marke").with("for", "resource-marke"))
        .append(new ElementCreator("input").id("resource-marke").with("type", "text").with("value", resource.marke));

    /* In the end, we add the code to handle saving the resource on the server and terminating edit mode */
    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', (event) => {
            /* Why do we have to prevent the default action? Try commenting this line.
            To prevent the browser from executing the default action of the selected element. */
            event.preventDefault();

   /* formCreator
        .append(new ElementCreator("label").text("Name").with("for", "resource-modell"))
        .append(new ElementCreator("input").id("resource-modell").with("type", "text").with("value", resource.modell)); */


            /* The user saves the resource.
               Task 4 - Part 2: We manually set the edited values from the input elements to the resource object. 
               Again, this code here is just an example of how the name of our example resource can be obtained
               and set in to the resource. The idea is that you handle your own properties here.
            */
            resource.modell = document.getElementById("resource-modell").value;
            resource.preis = document.getElementById("resource-preis").value;
            resource.marke = document.getElementById("resource-marke").value;


            /* Task 4 - Part 3: Call the update endpoint asynchronously. Once the call returns successfully,
               use the code below to remove the form we used for editing and again render 
               the resource in the list.
            */
           
        const url = `/api/resources/${resource.id} `;

        const payload = {
            modell: resource.modell,
            preis: resource.preis,
            marke: resource.marke
        }

        const headers = {
            'Content-Type': 'application/json', // Set the content type as JSON
            // You may need to include other headers like authentication tokens if required
          };

          fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(payload), // Convert the data to JSON format
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.text();
            })
            .then(responseText => {
                if (responseText === 'OK') {
                  console.log('PUT request successful:', responseText);
                  add(resource, document.getElementById(resource.idforDOM));
                } else {
                  throw new Error('Unexpected response from the server');
                }
              })
              .catch(error => {
                console.error('There was a problem with the PUT request:', error);
              });


       

       
           
           
          //  add(resource, document.getElementById(resource.idforDOM));  // <- Call this after the resource is updated successfully on the server
        }))
        .replace(document.querySelector('main'), document.getElementById(resource.idforDOM));
}

function remove(resource) {
    document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
function create() { 
}
    

document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Resource(), resource));
            }
        });
});

