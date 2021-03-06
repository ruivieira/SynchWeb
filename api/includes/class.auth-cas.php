<?php

require_once('config.php');

class CASAuthentication extends AuthenticationBase implements Authentication {

    function check() {
        global $cas_url, $cas_sso, $cacert;

        if (!$cas_sso) return false;

        require_once 'lib/CAS/CAS.php';
        phpCAS::client(CAS_VERSION_2_0, $cas_url, 443, '/cas');
        phpCAS::setCasServerCACert($cacert);

        try {
            // CAS will try and redirect us
            $check = phpCAS::checkAuthentication();

            // phpCAS will now lumber us with a session, which we dont want
            $params = session_get_cookie_params();
            setcookie(session_name(), '', 0, $params['path'], $params['domain'], $params['secure'], isset($params['httponly']));
            session_unset();
            session_destroy();

            if ($check) return phpCAS::getUser();

        // Dont crash the app
        } catch (Exception $e) {

        }
    }

    function authenticate($login, $password) {
        global $cas_url;

        $fields = array(
            'username' => $login,
            'password' => $password,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://'.$cas_url.'/cas/v1/tickets');
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $this->response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // CAS returns 201 = Created
        return $code == 201;
    }

}
