
export const convertUUid = (uuid: any) => {
    if(uuid) {

      const id = uuid;
        const stringedUuid = id?.toString();
        return stringedUuid;
    }
    return null;

}