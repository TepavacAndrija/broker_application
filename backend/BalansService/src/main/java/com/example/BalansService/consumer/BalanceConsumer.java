package com.example.BalansService.consumer;

import com.example.protobuf.BalanceProto;
import com.example.protobuf.OTEProto;
import com.example.protobuf.TradeProto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BalanceConsumer {

    @Value("${app.prices.csv-path}")
    private String pricesCsvPath;

    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    @KafkaListener(topics = "TradeEvents", groupId = "BalanceGroup")
    public void listen(byte[] request)throws Exception{

        var a= BalanceProto.DailyBalanceRequest.parseFrom(request);

        System.out.println("Primljeno " + a.getTradesCount() + " trgovina za dan: " + a.getDate());

        Map<String, Double> prices = loadPricesFromCSV(a.getDate());

        Map<String, Double> accountOteMap = new HashMap<>();

        for(TradeProto.TradeEvent trade : a.getTradesList()){
            if(!"MATCHED".equals(trade.getStatus()))
                continue;

            Double marketPrice = prices.get(trade.getInstrumentId());
            if (marketPrice == null) {
                System.out.println("Nema cene za instrument: " + trade.getInstrumentId());
                continue;
            }


            double directionFactor = trade.getDirection() == TradeProto.Direction.BUY ? 1.0 : -1.0;
            double ote = (marketPrice - trade.getPrice()) * trade.getQuantity() * directionFactor;

            System.out.println(trade.getInstrumentId() + " " + marketPrice + " " + trade.getPrice()+ " , a ote je=" + ote );

            accountOteMap.merge(trade.getAccountId(), ote, Double::sum);
        }

        OTEProto.OTEUpdateResponse.Builder responseBuilder = OTEProto.OTEUpdateResponse.newBuilder();
        responseBuilder.setDate(a.getDate());
        accountOteMap.forEach((accountId, ote) ->
                responseBuilder.addAccountOte(OTEProto.OTEUpdate.newBuilder()
                        .setAccountId(accountId)
                        .setOte(ote)
                        .build())
        );

        System.out.println("account map evo ga = " + accountOteMap);

        kafkaTemplate.send("BalanceEventsAck", UUID.randomUUID().toString(), responseBuilder.build().toByteArray());
    }

    private Map<String, Double> loadPricesFromCSV(String date) {
        Map<String, Double> result = new HashMap<>();
        ClassPathResource resource = new ClassPathResource(pricesCsvPath);
        try(BufferedReader br = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
            String line;
            while((line = br.readLine()) != null){
                String[] lineSplit = line.split(",");
                if(lineSplit.length == 3 && lineSplit[1].equals(date)){
                    result.put(lineSplit[0], Double.parseDouble(lineSplit[2]));
                }
            }
        }
        catch(Exception e){
            e.printStackTrace();
        }
        return result;
    }
}
