import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req:Request, { params: { courseId }}: { params: { courseId: string }}) {
    try {
        const { userId } = auth();
        const { price } = await req.json();

        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        };


        if(!price) {
            return new NextResponse('Price is required', { status: 400 })
        };

        const updateQuery = `UPDATE course SET price = ?, user_id = ?  WHERE id = ?`;
        const params = [price, userId, courseId];
        const courseDetails = {
            price,
            userId,
            courseId
        }

        await cassandraDb.execute(updateQuery, params, { prepare: true })
        .then(() => console.log('Updated succcesfully'))
        .catch(err => console.log(err));

        return NextResponse.json(courseDetails); 

    } catch (error) {
        console.log('[PRICE_PATCH]', error);
        return new NextResponse('Internal error', { status: 500 })
        
    }

}
