import {useTranslation} from "react-i18next";
import {Modal} from "./Modal";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function LicenseModal({open, onClose}: Props) {
    const {t} = useTranslation();
    return (
        <Modal title={t("license.title")} open={open} onClose={onClose}>
            <p>{t("license.copyright")}</p>
            <p>{t("license.rights")}</p>
            <p>
                Redistribution and use in source and binary forms, with or without
                modification, are permitted provided that the following conditions are
                met:
            </p>
            <ol>
                <li>
                    Redistributions of source code must retain the above copyright
                    notice, this list of conditions and the following disclaimer.
                </li>
                <li>
                    Redistributions in binary form must reproduce the above copyright
                    notice, this list of conditions and the following disclaimer in the
                    documentation and/or other materials provided with the distribution.
                </li>
                <li>
                    Neither the name of the copyright holder nor the names of its
                    contributors may be used to endorse or promote products derived from
                    this software without specific prior written permission.
                </li>
            </ol>
            <p>
                THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
                IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
                TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
                PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL{" "}
                {"<COPYRIGHT HOLDER>"} BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
                SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
                LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
                DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
                THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
                OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            </p>
        </Modal>
    );
}
