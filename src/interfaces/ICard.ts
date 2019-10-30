export interface ICard {
    id: number;

    // abilities: string[];
    // category: string;
    // cost: number;
    // datastore_id: number;
    // element: string;
    // image: string;
    // is_ex_burst: boolean;
    // is_multi_playable: boolean;
    // job: string;
    // name: string;
    // octgn_id: string;
    // power: number;
    // rarity: string;
    // serial_number: string;
    // type: string;
}

export interface IUUIDCard extends ICard{
    uuid: number;
}