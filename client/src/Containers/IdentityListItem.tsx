import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Button, { NodeType } from '../Components/Button';
import { Color, Size } from '../Components/Variables';
import useStorage from '../Hooks/IdentitiesContext';
import Identity from '../lib/Identity';

type IdentityListItemProps = {
    identity: Identity,
};

const PENDING_EXPORT_LINK = '#';

export default function IdentityListItem({ identity }: IdentityListItemProps): h.JSX.Element {
    const {
        deleteIdentity,
        setCurrentIdentity,
        currentIdentity,
    } = useStorage();
    const isCurrent = currentIdentity?.name === identity.name;
    const [publicKeyLink, setPublicKeyLink] = useState(PENDING_EXPORT_LINK);
    const [privateKeyLink, setPrivateKeyLink] = useState(PENDING_EXPORT_LINK);

    useEffect(() => {
        currentIdentity?.getPublicKey().then((publicKeyLink) => {
            const downloadAttribute = `data:text/plain;charset=utf-8,${encodeURIComponent(publicKeyLink)}`;
            setPublicKeyLink(downloadAttribute);
        });
        currentIdentity?.getPrivateKey().then((privateKeyLink) => {
            if (!privateKeyLink) return;
            const downloadAttribute = `data:text/plain;charset=utf-8,${encodeURIComponent(privateKeyLink)}`;
            setPrivateKeyLink(downloadAttribute);
        });
    }, [currentIdentity])
    return (
        <tr>
            <td>{identity.name}</td>
            <td>
                <Button
                    color={Color.PRIMARY}
                    size={Size.SMALL}
                    nodeType={NodeType.A}
                    disabled={publicKeyLink === PENDING_EXPORT_LINK}
                    download="public_key.pem"
                    href={publicKeyLink}
                >
                    Public key
                </Button>
                { identity.hasPrivateKey() ?
                    <Button
                        color={Color.PRIMARY}
                        size={Size.SMALL}
                        nodeType={NodeType.A}
                        disabled={privateKeyLink === PENDING_EXPORT_LINK}
                        download="private_key.pem"
                        href={privateKeyLink}
                    >
                        Private key
                    </Button>
                    : null}
            </td>
            <td>
                <Button
                    color={Color.PRIMARY}
                    disabled={isCurrent || !identity.hasPrivateKey()}
                    onClick={() => {
                        if (isCurrent) return;
                        setCurrentIdentity(identity.name)
                    }}
                >
                    Choose
                </Button>
                <Button
                    color={Color.PRIMARY}
                    disabled={isCurrent}
                    onClick={() => {
                        if (isCurrent) return;
                        deleteIdentity(identity.name)
                    }}
                >
                    Delete
                </Button>
            </td>
        </tr>
    )
}