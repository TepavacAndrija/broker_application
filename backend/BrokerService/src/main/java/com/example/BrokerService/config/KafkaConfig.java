//package com.example.BrokerService.config;
//
//import com.example.protobuf.BalanceProto;
//import com.example.protobuf.OTEProto;
//import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
//import io.confluent.kafka.serializers.protobuf.KafkaProtobufSerializer;
//import org.apache.kafka.clients.consumer.ConsumerConfig;
//import org.apache.kafka.clients.producer.ProducerConfig;
//import org.apache.kafka.common.serialization.StringDeserializer;
//import org.apache.kafka.common.serialization.StringSerializer;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.kafka.annotation.EnableKafka;
//import org.springframework.kafka.core.*;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@Configuration
//@EnableKafka
//public class KafkaConfig {
//
//    @Bean
//    public ProducerFactory<String, BalanceProto.DailyBalanceRequest> producerFactory() {
//        Map<String, Object> config = new HashMap<>();
//        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
//        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
//        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, KafkaProtobufSerializer.class);
//        config.put("schema.registry.url", "http://localhost:8081");
//        config.put("specific.avro.reader", "true");
//        return new DefaultKafkaProducerFactory<>(config);
//    }
//
//    @Bean
//    public ConsumerFactory<String, OTEProto.OTEUpdateResponse> consumerFactory() {
//        Map<String, Object> config = new HashMap<>();
//        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
//        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
//        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, KafkaProtobufDeserializer.class);
//        config.put(ConsumerConfig.GROUP_ID_CONFIG, "broker-group");
//
//        config.put("schema.registry.url", "http://localhost:8081");
//        config.put("specific.avro.reader", "true");
//
//        return new DefaultKafkaConsumerFactory<>(config);
//    }
//
//    @Bean
//    public KafkaTemplate<String, BalanceProto.DailyBalanceRequest> kafkaTemplate() {
//        return new KafkaTemplate<>(producerFactory());
//    }
//}