
document.getElementById("urlform").addEventListener('submit', handleSubmit);
document.getElementById("urlform").addEventListener('reset', handleReset);

function handleReset(event) {
    const generatedurl = document.getElementById("generatedurl");
    generatedurl.style.display = "none";
}

// can't define handleSubmit as arrow func, as i am referencing it above.
// variables defined using let and const are only available in their scope.
async function handleSubmit(event) {
    event.preventDefault();

    const url = document.getElementById("url").value;
    const slug = document.getElementById("slug").value;
    let response = await createURL(url, slug);

    const generatedurl = document.getElementById("generatedurl");
    generatedurl.style.display = "block";

    if (response.status === 500) {
        // although 500 code is general error code. so anything could be wrong with server.
        generatedurl.innerHTML = `Sorry, slug - ${slug} already in use.`
        console.log(response);
        return;
    }

    response = await response.json();

    const displaymsg = `shortened URL : <b>websitename/${response.slug}</b><br>
    URL : ${response.url}`
    generatedurl.innerHTML = displaymsg;
}


const createURL = async (url, slug) => {
    let response = await fetch("/url", {
        method: "POST",
        headers: {
            'content-type' : 'application/json',
        },
        body: JSON.stringify({
            url: url,
            slug: slug
        })
    })

    return response;
}