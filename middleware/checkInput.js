

export const checkInput = async (req, res, next) => {
    console.log("Inside check input");
    const DISALLOWED_CHARS = ['!', '#', '$', "'", '"', '>', '<', ';', '-', '+', '=', '$', '€', '%', '&', '(', ')', '[', ']', '{', '}', '/', '\\'];

    // Check if request body exists and is an object
    if (typeof req.body !== 'object') {
        return next(new Error('Request body must be an object'));
    }

    // Loop through each property in the request body
    for (const prop in req.body) {
        if (typeof req.body[prop] !== 'string') {
            // Skip if property value is not a string
            continue;
        }
        if ((prop === "time") || (prop === "category") || (prop === "county")) {
            //Skip since this is not user input
            continue;
        }
        // Check for disallowed characters in property value
        if (DISALLOWED_CHARS.some((char) => req.body[prop].includes(char))) {
            return next(new Error(`Input must not contain the following characters: ${DISALLOWED_CHARS.join(', ')}`));
        }
    }
    next();
}
