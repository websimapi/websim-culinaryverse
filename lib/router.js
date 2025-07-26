export class Router {
    constructor(routes) {
        this.routes = routes;
    }

    match(path) {
        for (const route in this.routes) {
            const paramNames = [];
            const regexPath = route.replace(/:(\w+)/g, (_, paramName) => {
                paramNames.push(paramName);
                return '([^/]+)';
            });

            const regex = new RegExp(`^${regexPath}$`);
            const match = path.match(regex);

            if (match) {
                const params = {};
                paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                return { component: this.routes[route], params };
            }
        }
        // Fallback to the root route if no match is found
        if (this.routes['/']) {
            return { component: this.routes['/'], params: {} };
        }
        return null;
    }
}

