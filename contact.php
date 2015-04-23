<?php

  /**
   * Alaja Contact Script
   * 
   * @package   15
   * @author    alaja <support@alaja.info>
   * @copyright 2015 The author
   */

  //*****************************************************
  $your_site_name = "SodaCamp";
  $your_email = "oleg@datalets.ch";
  //*****************************************************

  $the_msg = trim($_POST['message']);
  $the_mail = trim($_POST['email']);
  $the_name = trim($_POST['name']);

  //*****************************************************

  // check our form submit (3 normal fields + 1 secret)
  if ( !isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['message']) || !isset($_POST['id-1']) )
    $error['vars'] = true;

  // check fields that required
  if ( strlen($the_mail) < 1 || strlen($the_msg) < 1 )
    $error['strlen'] = true;

  // check email field
  if (preg_match('/[a-z0-9&\'\.\-_\+]+@[a-z0-9\-]+\.([a-z0-9\-]+\.)*+[a-z]{2,}/im', $the_mail, $matches))
    $the_mail = $matches[0];
  else
    $error['email'] = true;

  if (!isset($error)) {

    // no errors! good! you may add here special contact functional.

    // an email example:
    $header  = "MIME-Version: 1.0\r\n";
    $header .= "Content-type: text/html; charset=utf-8\r\n";
    $header .= "From: {$the_name} <{$the_mail}>\r\n";

    $result = mail($your_email, "Message from ".$your_site_name, nl2br($the_msg), $header); // mail(to, subject, message, header)
  }
?>

<h2 class="dwarf caps"><i class="if-like2 dropcap"></i> Cheers!</h2>
<hr>
<h3>We like your paper aeroplane.</h3>
<p><small>And will get back to you just as soon as we get off of Twitter and YouTube.</small></p>
<br>
