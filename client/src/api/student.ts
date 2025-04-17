type StudentProfileUpdate = {
    course: number,
    major: string;
    academic_performance: string;
}

export const StudentService = {
    async register(email: string) {
        const res = await fetch("http://localhost:8081/api/students", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email})
        })
        if(!res.ok) {
            throw new Error(await res.text())
        }
        return res.json()
    },

    async updateProfile(email:string, data: StudentProfileUpdate) {
        const res = await fetch(`http://localhost:8081/api/students/${email}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}