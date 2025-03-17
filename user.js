class Auth {
    constructor() {
        this.user = null
        this.client = supabase.createClient("https://rcsfnssnkxslecjxdtro.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjc2Zuc3Nua3hzbGVjanhkdHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTMwNzEsImV4cCI6MjA1NzcyOTA3MX0.mxnPxBS8amUbSmeD373CIR-8Gty2_qJobpYPgdwr9Oo")
    }

    async loggedIn() {
        const { data, error } = await this.client.auth.getSession()
        if (error) {
            console.log('failed to get signed in session: ', error)
            return false
        }
        return true
    }

    async signIn(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email, password
        })
        if (error) {
            return { data: null, error }
        }
        if (!(data?.session?.access_token)) {
            return { data: null, error: new Error("no access token found") }
        }
        this.client.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
        })
        return { data, error: null }
    }

    getClient() {
        return this.client
    }
}